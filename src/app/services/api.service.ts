import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Restangular } from 'ng2-restangular';
import { AuthenticationService } from './';
import { AUTH_TOKEN, USER_COMPANY_SIMULATION, BASE_URL } from '../master_data';

import 'rxjs/Rx';
import 'rxjs/add/observable/throw';

@Injectable()
export class ApiService {
	public secondsPassed:number = 0;

	constructor(
		private restangular: Restangular,
		private authService: AuthenticationService
	) {}
	setSecondsPassed(seconds) {
		this.secondsPassed = seconds;
	}
	index(path: string, params): Observable<any> {
		if(this.authService.isAuthorized()) {
			return this.restangular.withConfig((RestangularConfigurer) => {
						RestangularConfigurer.setDefaultHeaders(this.requestHeaders());
				}).all(path).getList();
		}
	}

	show(path: string, id: string, params): Observable<any> {
		if(this.authService.isAuthorized()) {
			return this.restangular.withConfig((RestangularConfigurer) => {
					RestangularConfigurer.setDefaultHeaders(this.requestHeaders());
				}).one(path, id).get(params);
		}
	}

	create(path: string, params): Observable<any> {
		params["simulation_time"] = this.secondsPassed;
		if(this.authService.isAuthorized()) {
			return this.restangular.withConfig((RestangularConfigurer) => {
					RestangularConfigurer.setDefaultHeaders(this.requestHeaders());
				}).all(path).post(params);
		}
	}

	updateTimeElapsed(time_elapsed) {
		if(this.authService.isAuthorized()) {
			var ucs = this.userCompanSimulationRestangularObject(BASE_URL+"/update_time_elapsed");
			ucs.time_elapsed = time_elapsed;
			ucs.put();
		} else {
			this.reAuthenticate();
		}
	}

	beginSimulation() {
		if(this.authService.isAuthorized()) {
			var ucs = this.userCompanSimulationRestangularObject(BASE_URL+"/begin_simulation");
			ucs.put();
		} else {
			this.reAuthenticate();
		}
	}

	endSimulation() {
		if(this.authService.isAuthorized()) {
			var ucs = this.userCompanSimulationRestangularObject(BASE_URL+"/end_simulation");
			ucs.put();
		} else {
			this.reAuthenticate();
		}
	}

	reAuthenticate() {
		if(AUTH_TOKEN && !this.authService.isAuthorized()) {
			this.authService.authenticate({
	  		auth_token: AUTH_TOKEN,
	  		grant_type: "password",
	  		scope: "user"
	  	}).subscribe(response => { });
		} else {
			console.log("Something went wrong. \nYour response is not saved. Please revisit the url from your email. \nNote: Don't reload the page. Use link from email.");
		}
	}

	requestHeaders() {
		return {
				'Authorization': 'Bearer ' + this.authService.getJwt(),
				'Content-Type': 'application/json',
				 Accept: 'application/json'
			}
	}
	userCompanSimulationRestangularObject(url): any {
		return this.restangular.withConfig((RestangularConfigurer) => {
						RestangularConfigurer.setDefaultHeaders(this.requestHeaders());
					}).one(url, "");
	}
}
