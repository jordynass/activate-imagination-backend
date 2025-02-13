import { OutputService } from 'src/shared/output.service';
import { Module } from '@nestjs/common';
import { ClientService } from 'src/shared/client.service';
import { AsyncInputService } from './async_input.service';

@Module({
  providers: [ClientService, OutputService, AsyncInputService],
  exports: [ClientService, OutputService, AsyncInputService],
})
export class IoModule {}
