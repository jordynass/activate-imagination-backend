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
import { AsyncInputService, InputKey } from 'src/shared/async_input.service';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { heroSceneNode } from '../nodes/hero_nodes/hero_scene_node';
import { getAIMessageChunkText } from 'src/shared/utils';

@Injectable()
export class GraphService {
  private graph = null;
  private memory = new MemorySaver();
  private configs: Array<{ configurable: { thread_id: string } }> = [];

  constructor(
    private readonly outputService: OutputService,
    private readonly asyncInputService: AsyncInputService,
    @Inject('GAME_MASTER_NODE') private readonly gameMasterNode,
    @Inject('TOOLS') private readonly tools,
  ) {}

  async startGame(input: StoryDto) {
    this.graph = this.graph ?? this.buildGraph();
    const config = toConfig(input.gameId);
    this.configs.push(config);

    let nextState: Command | typeof GraphAnnotation.State =
      await prepareInputNode(input);
    let nextNodeList = [START];
    do {
      if (nextNodeList.includes('heroActionNode')) {
        const action = await this.asyncInputService.requestInput(
          InputKey.ACTION,
          input.gameId,
        );
        const actionMessage = new HumanMessage(action, {
          inputKey: InputKey.ACTION,
        });
        nextState = new Command({ resume: actionMessage });
      }
      const stream = await this.graph.stream(nextState, config);
      for await (const [msg] of stream) {
        if (isAIMessageChunk(msg)) {
          this.outputService.stream(getAIMessageChunkText(msg), input.gameId);
        }
      }
      this.outputService.endStream(input.gameId, InputKey.ACTION);
      const state = await this.getState(input.gameId);
      nextNodeList = state.next;
    } while (nextNodeList?.length);
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

  async getState(gameId: string) {
    return await this.graph.getState(toConfig(gameId));
  }

  async getStateHistory(gameId: string) {
    return await this.graph.getStateHistory(toConfig(gameId));
  }
}

function toConfig(gameId: string) {
  return {
    configurable: { thread_id: gameId },
    streamMode: 'messages',
  };
}

export const TEST_ONLY = { toConfig };
