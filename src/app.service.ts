import { Injectable } from '@nestjs/common';
import { GraphService } from './lang_graph/graph_service';
import { SystemMessage } from '@langchain/core/messages'

@Injectable()
export class AppService {
  constructor(private readonly graphService: GraphService) {}

  async startGame(storyPrompt: string): Promise<void> {
    const graph = this.graphService.buildGraph();
    graph.invoke({
      messages: [new SystemMessage(storyPrompt)],
    });
  }
  
  getHello(): string {
    return 'Hello World!';
  }
}
