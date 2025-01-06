import { Injectable } from '@nestjs/common';
import { StateGraph, START, END, MemorySaver } from '@langchain/langgraph';
import { GraphAnnotation } from './entities/state';
import { StoryDto } from './entities/io';
import { sceneNode } from './nodes/scene/scene_node';
import { prepareInputNode } from './nodes/prepare_input_node';
import { isAIMessageChunk } from '@langchain/core/messages';

@Injectable()
export class GraphService {
  private graph = null;
  private memory = new MemorySaver();
  private configs: Array<{ configurable: { thread_id: string } }> = [];

  async startGame(input: StoryDto): Promise<void> {
    this.graph = this.graph ?? this.buildGraph();
    const configId = this.configs.length;
    const config = toConfig(configId);
    this.configs.push(config);

    const initialState = await prepareInputNode(input);

    do {
      const stream = await this.graph.stream(initialState, config);
      for await (const [msg] of stream) {
        if (
          isAIMessageChunk(msg) &&
          msg.content &&
          typeof msg.content === 'string'
        ) {
          console.log(msg.content);
        }
      }
    } while (this.getState(configId).next);
  }

  private buildGraph() {
    const graphBuilder = new StateGraph(GraphAnnotation);

    return graphBuilder
      .addNode('sceneNode', sceneNode)
      .addEdge(START, 'sceneNode')
      .addEdge('sceneNode', END)
      .compile({ checkpointer: this.memory });
  }

  getState(threadId: number) {
    return this.graph.getState(toConfig(threadId));
  }

  getStateHistory(threadId: number) {
    return this.graph.getStateHistory(toConfig(threadId));
  }
}

function toConfig(threadId: number) {
  return {
    configurable: { thread_id: String(threadId) },
    streamMode: 'messages',
  };
}
