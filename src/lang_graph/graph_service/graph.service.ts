import { Injectable } from '@nestjs/common';
import { StateGraph, START, END, MemorySaver } from '@langchain/langgraph';
import { GraphAnnotation } from 'src/lang_graph/entities/state';
import { StoryDto } from 'src/lang_graph/entities/io';
import { sceneNode } from 'src/lang_graph/nodes/scene/scene_node';
import { prepareInputNode } from 'src/lang_graph/nodes/prepare_input_node';
import { OutputService } from 'src/shared/output.service';
import { isAIMessageChunk } from '@langchain/core/messages';

@Injectable()
export class GraphService {
  private graph = null;
  private memory = new MemorySaver();
  private configs: Array<{ configurable: { thread_id: string } }> = [];

  constructor(private readonly outputService: OutputService) {}

  async startGame(input: StoryDto) {
    this.graph = this.graph ?? this.buildGraph();
    const configId = this.configs.length;
    const config = toConfig(configId);
    this.configs.push(config);

    const initialState = await prepareInputNode(input);

    do {
      const stream = await this.graph.stream(initialState, config);
      for await (const [msg] of stream) {
        if (isAIMessageChunk(msg) && typeof msg.content === 'string') {
          this.outputService.stream(msg.content);
        }
      }
      this.outputService.endStream();
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

export const TEST_ONLY = { toConfig };
