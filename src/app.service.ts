import { Injectable } from '@nestjs/common';
import { GraphService } from './lang_graph/graph_service';

@Injectable()
export class AppService {
  constructor(private readonly graphService: GraphService) {}

  async startGame(storyPrompt: string): Promise<void> {
    await this.graphService.startGame({storyPrompt});
  }
}
