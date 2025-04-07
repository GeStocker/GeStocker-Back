import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/create-websocket.dto';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Websocket } from './entities/websocket.entity';
import { Repository } from 'typeorm';
import { Collaborator } from '../collaborators/entities/collaborator.entity';

@Injectable()
export class WebsocketService {
  private clients: Map<string, Socket> = new Map();
  constructor(
    @InjectRepository(Websocket)
    private readonly messageRepository: Repository<Websocket>,
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>
  ){}

  registerClient(userId: string, socket: Socket){
    this.clients.set(userId,socket)
  }

  removeClient(socket: Socket) {
    const entry = [...this.clients.entries()].find(([_, s]) => s.id === socket.id)
    if (entry) this.clients.delete(entry[0])
  }

  getUserIdFromClient(socketid: string): string | undefined {
    const entry = [...this.clients.entries()].find(([__dirname, s]) => s.id === socketid);
    return entry?.[0]
  }

  async saveMessage(dto: MessageDto): Promise<Websocket> {
    const sender = await this.collaboratorRepository.findOneBy({ id: dto.sender });
    const receiver = await this.collaboratorRepository.findOneBy({ id: dto.receiver });

    const message = this.messageRepository.create({
      content: dto.content,
      sender,
      receiver,
    }as Partial<Websocket>);

    return await this.messageRepository.save(message)
  }

  sendMessageToReceiver(message: Websocket) {
    const receiveSocket = this.clients.get(message.receiver.id);
    if(receiveSocket) {
      receiveSocket.emit('receiveMessage', message)
    }
  }

  async getMessagesBetween(senderId: string, receiverId:string): Promise<Websocket[]>{
    return this.messageRepository.find(({
      where: [
        {sender: {id: senderId}, receiver: {id:receiverId}},
        {sender: {id: receiverId}, receiver: {id: senderId}}
      ],
      order: {createdAt: 'ASC'}
    }))
  }

}
