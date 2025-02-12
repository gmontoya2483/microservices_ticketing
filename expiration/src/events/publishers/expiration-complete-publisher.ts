import {ExpirationCompleteEvent, Publisher, Subjects} from "@gabrielhernan_tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}