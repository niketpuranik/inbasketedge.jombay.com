import{ Injectable, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api.service';
import * as MasterData from '../master_data';

import 'rxjs/Rx';
import 'rxjs/add/observable/throw';

@Injectable()
export class SimulationService {

  public simulationFetched: EventEmitter<Object>;

	constructor (
		private apiService: ApiService
	) {
	  this.simulationFetched = new EventEmitter();
	}

	setInitialData(response) {
	  var user_company_simulation = response.user_company_simulation;
	  console.log(user_company_simulation);
	  var simulation = user_company_simulation.company_simulation.simulation;
		this.setSimulation(simulation);
		this.setUserCompanySimulation(user_company_simulation);
		this.setActivityGroups(simulation.activity_groups);
		this.setEmails(simulation.emails);
		this.setPersons(simulation.persons);
		this.setNotifications(simulation.notifications);
		this.setEmailActivities(user_company_simulation.email_activities);
		this.setPersonActivities(user_company_simulation.person_activities);
		this.setUserEvents(user_company_simulation.user_events);
		this.setEmailQuestionResponses(user_company_simulation.email_question_responses);
	}

	setEmailQuestionResponses(email_question_responses) {
		MasterData.setEmailQuestionResponses(email_question_responses);
	}

	setNotifications(notifications) {
		MasterData.setNotifications(notifications);
	}

	setUserEvents(user_events) {
		MasterData.setUserEvents(user_events);
	}

	setPersonActivities(person_activities) {
		MasterData.setPersonActivities(person_activities);
	}

	setEmailActivities(email_activities) {
		MasterData.setEmailActivities(email_activities);
	}

	setSimulation(simulation) {
		MasterData.setSimulation(simulation);
	}

	setActivityGroups(activity_groups) {
	  MasterData.setActivityGroups(activity_groups);
	  var activities = [];
	  for(let activity_group of activity_groups) {
			activities.push(activity_group.simulation_activities);
		}
		MasterData.setActivities([].concat.apply([],activities));
	}

	setEmails(emails) {
		MasterData.setEmails(emails);
	}

	setPersons(persons) {
		MasterData.setPersons(persons);
	}

	setCurrentUser(current_user_data) {
		MasterData.setCurrentUser(current_user_data);
	}

	setUserCompanySimulation(user_company_simulation) {
		MasterData.setUserCompanySimulation(user_company_simulation);
	}
}




