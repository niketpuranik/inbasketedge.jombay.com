import{ Injectable } from '@angular/core'
import { EMAILS } from '../master_data'

@Injectable()
export class EmailService {

	constructor () { }

	getEmails(){
		return EMAILS;
	}

	getEmail(id){
	  return EMAILS.find(email => email._id.$oid === id)
	}
}
