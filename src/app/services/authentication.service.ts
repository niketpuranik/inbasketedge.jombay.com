import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CanActivate } from '@angular/router';
import { CookieService, CookieOptionsArgs } from 'angular2-cookie/core';
import { Restangular } from 'ng2-restangular';
import { AUTH_TOKEN } from '../master_data';

import 'rxjs/Rx';

@Injectable()
export class AuthenticationService implements CanActivate {
	JWT_KEY: string = 'jomabay_simulation_token';
	JWT: string = '';

	constructor(
		 private restangular: Restangular,
		 private cookieService: CookieService
	 ) {
		const token = cookieService.get(this.JWT_KEY);
		if (token) {
			this.setJwt(token);
		}
	}

	setJwt(jwt) {
		var currentTime = new Date();
		const cookieArgs: CookieOptionsArgs = {
			expires: new Date(currentTime.setSeconds(currentTime.getSeconds() + jwt.expires_in)),
		};
		this.cookieService.put(this.JWT_KEY, jwt.access_token, cookieArgs);
	}
	getJwt(): string {
		return this.cookieService.get(this.JWT_KEY);
	}

	isAuthorized(): boolean {
		return Boolean(this.cookieService.get(this.JWT_KEY));
	}

	canActivate(): boolean {
		const canActivate = this.isAuthorized();
		this.onCanActivate(canActivate);
		return canActivate;
	}

	onCanActivate(canActivate: boolean) {
		if (!canActivate && AUTH_TOKEN) {
			this.authenticate({
	  		auth_token: AUTH_TOKEN,
	  		grant_type: "password",
	  		scope: "user"
	  	}).subscribe(response => { });
		}
	}

	authenticate(creds): Observable<any> {
		return this.restangular.all(`oauth/token`).post(creds)
			.map((res) => { this.setJwt(res); })
			.catch((error:any) => Observable.throw(error.json().error || 'Server error'));
	}
}
