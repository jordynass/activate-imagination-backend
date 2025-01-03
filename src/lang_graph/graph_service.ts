import { Injectable } from '@nestjs/common';
import { StateGraph, START, END } from '@langchain/langgraph';
import { GraphAnnotation } from './entities/state';
import { sceneNode } from './nodes/scene/scene_node';

@Injectable()
export class GraphService {
  buildGraph() {
    const graphBuilder = new StateGraph(GraphAnnotation);

    return graphBuilder
      .addNode('sceneNode', sceneNode)
      .addEdge(START, 'sceneNode')
      .addEdge('sceneNode', END)
      .compile();
  }
}
