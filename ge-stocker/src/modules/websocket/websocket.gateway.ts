import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
import { MessageDto } from './dto/create-websocket.dto';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({ cors: {
  origin: '*'
}})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect{
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly jwtService: JwtService
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) throw new UnauthorizedException('Token no encontrado');

      const payload = this.jwtService.verify(token);
      const userId = payload.id;
      this.websocketService.registerClient(userId,client)
    } catch (error) {
      client.disconnect();
      
    }

  }
  handleDisconnect(client: Socket) {
    this.websocketService.removeClient(client)
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: {receiveId: string, content: string},
    @ConnectedSocket() client: Socket
  ) {
    const senderId = this.websocketService.getUserIdFromClient(client.id);
    if (!senderId) return;

    const message = await this.websocketService.saveMessage({
      sender: senderId, 
      receiver: payload.receiveId, 
      content:  payload.content
    });

    this.websocketService.sendMessageToReceiver(message)
    client.emit('receiveMessage', message)
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() data: { sender: string; receiver: string },
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.websocketService.getMessagesBetween(data.sender, data.receiver);
    client.emit('messageHistory', messages);
  }

}
