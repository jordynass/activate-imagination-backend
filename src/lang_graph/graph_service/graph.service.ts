/**
 * @fileoverview Service for running the LangGraph.
 * It builds and connects the nodes and passes the streamed message chunks coming into the
 * graph state to the OutputService.
 */

import { Inject, Injectable } from '@nestjs/common';
import {
  StateGraph,
  START,
  MemorySaver,
  Command,
  END,
} from '@langchain/langgraph';
import { GraphAnnotation } from 'src/lang_graph/entities/state';
import { StoryDto } from 'src/lang_graph/entities/io';
import { sceneNode } from 'src/lang_graph/nodes/scene_node';
import { prepareInputNode } from 'src/lang_graph/nodes/prepare_input_node';
import { OutputService } from 'src/shared/output.service';
import { HumanMessage, isAIMessageChunk } from '@langchain/core/messages';
import { heroActionNode } from '../nodes/hero_nodes/hero_action_node';
import { AsyncInputService } from 'src/shared/async_input.service';
import { InputKey } from 'src/lang_graph/entities/input_events';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { heroSceneNode } from '../nodes/hero_nodes/hero_scene_node';
import { getAIMessageChunkText } from 'src/shared/utils';

@Injectable()
export class GraphService {
  private memory = new MemorySaver();
  private configs: Array<{ configurable: { thread_id: string } }> = [];

  constructor(
    private readonly outputService: OutputService,
    private readonly asyncInputService: AsyncInputService,
    @Inject('GAME_MASTER_NODE') private readonly gameMasterNode,
    @Inject('TOOLS') private readonly tools,
  ) {}

  async startGame(input: StoryDto) {
    const graph = this.buildGraph();
    const config = toConfig(input.gameId);
    const { gameId } = input;
    this.configs.push(config);

    let nextState: Command | typeof GraphAnnotation.State =
      await prepareInputNode(input);
    let nextNodeList = [START];
    do {
      if (nextNodeList.includes('heroActionNode')) {
        nextState = await this.handleHeroActionNode(gameId);
      }
      if (nextNodeList.includes('heroSceneNode')) {
        nextState = await this.handleHeroSceneNode(gameId);
      }
      const stream = await graph.stream(nextState, config);
      for await (const [msg] of stream) {
        if (isAIMessageChunk(msg)) {
          this.outputService.stream(getAIMessageChunkText(msg), input.gameId);
        }
      }
      const state = await graph.getState(config);
      nextNodeList = state.next;
    } while (nextNodeList?.length);
  }

  private async handleHeroActionNode(gameId: string): Promise<Command> {
    this.outputService.endStream(gameId, InputKey.ACTION);
    const action = await this.asyncInputService.requestInput(
      InputKey.ACTION,
      gameId,
    );
    const actionMessage = new HumanMessage(action);
    return new Command({ resume: actionMessage });
  }

  private async handleHeroSceneNode(gameId: string): Promise<Command> {
    this.outputService.endStream(gameId, InputKey.NEW_SCENE);
    const photo = await this.asyncInputService.requestInput(
      InputKey.NEW_SCENE,
      gameId,
    );
    return new Command({ resume: photo });
  }

  private buildGraph() {
    const graphBuilder = new StateGraph(GraphAnnotation);
    return graphBuilder
      .addNode('sceneNode', sceneNode)
      .addNode('heroActionNode', heroActionNode)
      .addNode('heroSceneNode', heroSceneNode)
      .addNode('gameMasterNode', this.gameMasterNode, {
        ends: ['toolNode', 'heroActionNode'],
      })
      .addNode('toolNode', new ToolNode(this.tools), {
        ends: [END, 'heroSceneNode'],
      })
      .addEdge(START, 'sceneNode')
      .addEdge('sceneNode', 'heroActionNode')
      .addEdge('heroActionNode', 'gameMasterNode')
      .addEdge('heroSceneNode', 'sceneNode')
      .compile({ checkpointer: this.memory });
  }
}

function toConfig(gameId: string) {
  return {
    configurable: { thread_id: gameId },
    streamMode: 'messages' as const,
  };
}

export const TEST_ONLY = { toConfig };
