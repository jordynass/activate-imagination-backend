import { Injectable } from '@nestjs/common';
import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphAnnotation, InputAnnotation } from './entities/state';
import { sceneNode } from './nodes/scene/scene_node';
import { prepareInputNode } from './nodes/prepare_input_node';

@Injectable()
export class GraphService {
  async startGame(input: typeof InputAnnotation.State): Promise<void> {
    const graph = this.buildGraph();
    const initialState = await prepareInputNode(input);
    graph.invoke(initialState);
  }

  buildGraph() {
    const graphBuilder = new StateGraph(GraphAnnotation);

    return graphBuilder
      .addNode('sceneNode', sceneNode)
      .addEdge(START, 'sceneNode')
      .addEdge('sceneNode', END)
      .compile();
  }
}
