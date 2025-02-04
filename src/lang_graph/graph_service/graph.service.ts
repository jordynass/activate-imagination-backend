import { Injectable } from '@nestjs/common';
import { StateGraph, START, MemorySaver, Command } from '@langchain/langgraph';
import { GraphAnnotation } from 'src/lang_graph/entities/state';
import { StoryDto } from 'src/lang_graph/entities/io';
import { sceneNode } from 'src/lang_graph/nodes/scene/scene_node';
import { prepareInputNode } from 'src/lang_graph/nodes/prepare_input_node';
import { OutputService } from 'src/shared/output.service';
import { HumanMessage, isAIMessageChunk } from '@langchain/core/messages';
import { heroNode } from '../nodes/hero_node';
import { gameMasterNode } from '../nodes/game_master_node';
import { AsyncInputService, InputKey } from 'src/shared/async_input.service';

@Injectable()
export class GraphService {
  private graph = null;
  private memory = new MemorySaver();
  private configs: Array<{ configurable: { thread_id: string } }> = [];

  constructor(
    private readonly outputService: OutputService,
    private readonly asyncInputService: AsyncInputService,
  ) {}

  async startGame(input: StoryDto) {
    this.graph = this.graph ?? this.buildGraph();
    const config = toConfig(input.gameId);
    this.configs.push(config);

    let nextState: Command | typeof GraphAnnotation.State =
      await prepareInputNode(input);
    let nextNodeList = [START];
    do {
      if (nextNodeList.includes('heroNode')) {
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
        if (isAIMessageChunk(msg) && typeof msg.content === 'string') {
          this.outputService.stream(msg.content, input.gameId);
        }
      }
      this.outputService.endStream(input.gameId);
      nextNodeList = (await this.getState(input.gameId)).next;
    } while (nextNodeList?.length);
  }

  private buildGraph() {
    const graphBuilder = new StateGraph(GraphAnnotation);

    return graphBuilder
      .addNode('sceneNode', sceneNode)
      .addNode('heroNode', heroNode)
      .addNode('gameMasterNode', gameMasterNode)
      .addEdge(START, 'sceneNode')
      .addEdge('sceneNode', 'heroNode')
      .addEdge('heroNode', 'gameMasterNode')
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
