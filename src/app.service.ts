import { Injectable } from '@nestjs/common';
import { GraphService } from './lang_graph/graph_service';
import { StoryDto } from './lang_graph/entities/io';

/** This layer decouples the WebSocket gateway from the business logic. */
@Injectable()
export class AppService {
  constructor(private readonly graphService: GraphService) {}

  async startGame(input: StoryDto): Promise<void> {
    await this.graphService.startGame(input);
  }
}
