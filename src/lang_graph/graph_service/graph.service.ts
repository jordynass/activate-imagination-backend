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
import {
  AIMessageChunk,
  HumanMessage,
  isAIMessageChunk,
  MessageContentComplex,
} from '@langchain/core/messages';
import { heroNode } from '../nodes/hero_node';
import { AsyncInputService, InputKey } from 'src/shared/async_input.service';
import { ToolNode } from '@langchain/langgraph/prebuilt';

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
        if (isAIMessageChunk(msg)) {
          this.outputService.stream(getAIMessageChunkText(msg), input.gameId);
        }
      }
      this.outputService.endStream(input.gameId);
      const state = await this.getState(input.gameId);
      nextNodeList = state.next;
    } while (nextNodeList?.length);
  }

  private buildGraph() {
    const graphBuilder = new StateGraph(GraphAnnotation);

    return graphBuilder
      .addNode('sceneNode', sceneNode)
      .addNode('heroNode', heroNode)
      .addNode('gameMasterNode', this.gameMasterNode, {
        ends: ['toolNode', 'heroNode', END],
      })
      .addNode('toolNode', new ToolNode(this.tools))
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

function getAIMessageChunkText(chunk: AIMessageChunk): string {
  if (typeof chunk.content === 'string') {
    return chunk.content;
  }
  const complexContentList: MessageContentComplex[] = chunk.content;
  const allText = complexContentList.map((mcc) => (mcc as any).text ?? '');
  return allText.join('');
}

export const TEST_ONLY = { toConfig, getAIMessageChunkText };
