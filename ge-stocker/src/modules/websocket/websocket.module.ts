import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { WebsocketGateway } from './websocket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Websocket } from './entities/websocket.entity';
import { Collaborator } from '../collaborators/entities/collaborator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Websocket, Collaborator])],
  providers: [WebsocketGateway, WebsocketService],
})
export class WebsocketModule {}
