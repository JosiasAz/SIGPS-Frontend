import { Provider } from '@angular/core';
import { environment } from '../../env/environment';
import { AbstractChatService } from './abstract-chat.service';
import { MockedChatService } from './mocked-chat.service';
import { ChatService } from './chat.service';

export const ChatProvider: Provider = {
  provide: AbstractChatService,
  useClass: environment.useMock ? MockedChatService : ChatService,
};
