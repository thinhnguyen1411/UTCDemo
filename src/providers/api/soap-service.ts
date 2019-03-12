import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Network } from '@ionic-native/network/ngx';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/Rx';

import xml2js from 'xml2js';

/*
  Generated class for the HttpServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

let testBaseURL = "";
// let testBaseURL = "https://CHKKLK02.AP.CARRIER.UTC.COM:8243/" ;
// let soapAction = "http://podemosap.azurewebsites.net/saplogon.asmx/";
@Injectable()
export class HttpServiceProvider {

	loading;
	networkType: string = "";
	networkStatusOnline: boolean = true;

	constructor(public http: HttpClient, public loadingCtrl: LoadingController, public network: Network, public toastCtrl: ToastController, public alertController: AlertController) {
		console.log('Hello HttpServiceProvider Provider');
		if (this.networkType == "unknown" || this.networkType == "none" || this.networkType == undefined) {
			this.displayNetworkStatus('Your internet connection appears to be offline !!!');
			this.networkStatusOnline = false;
		} else {
			this.displayNetworkStatus('You have an active internet connection');
			this.networkStatusOnline = true;
		}
		this.loading = this.loadingCtrl.create({
			content: 'Please wait...',
			dismissOnPageChange: true
		});
		// this.http.get('../../assets/dummy/login-failed.xml').subscribe(data => {
		// 	console.log(data.toString());
		// });
		this.http.get("../../assets/config/config.xml", { responseType: 'text' }).subscribe(data => {
			let parser = new DOMParser();
			let doc = parser.parseFromString(data, "application/xml");
			  var serviceURL = doc.getElementsByTagName("ServiceURL")[0].textContent as string;
				testBaseURL = serviceURL;
		})
	}

	public makeGetSoapRequest(url, param) {
		if (this.networkStatusOnline) {
			return new Promise((resolve, reject) => {
				let xhr = new XMLHttpRequest();
				xhr.open('GET', testBaseURL + url, true);
				xhr.setRequestHeader('Content-Type', 'text/xml');
				xhr.setRequestHeader("SOAPAction", "url"); //optional
				xhr.responseType = "text";
				xhr.onload = () => {
					this.hideSpinner();
					if (xhr.status >= 200 && xhr.status < 300) {
						//resolve(this.convertXmltoJson(xhr.responseText));
					} else {
						reject(xhr.statusText);
					}
				};
				xhr.onerror = () => {
					this.hideSpinner();
					reject(xhr.statusText)
				};
				xhr.send(param);
			});
		} else {
			this.displayNetworkStatus('Your internet connection appears to be offline !!!');
			return null;
		}
	}

	async makePostSoapRequest(url, param) {
		if (this.networkStatusOnline) {
			return new Promise((resolve, reject) => {
				//this.showSpinner();
				let xhr = new XMLHttpRequest();
				xhr.open('POST', testBaseURL + url, true);
				//xhr.withCredentials=true;
				xhr.setRequestHeader('Content-Type', 'application/soap+xml');
				// xhr.setRequestHeader('Accept', 'application/soap+xml');
				//xhr.setRequestHeader('withCredentials', 'true');
				// xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
				xhr.setRequestHeader('Authorization', 'Bearer 0edef49e-f826-303f-acd8-e423e3ab5a1e');
				// xhr.setRequestHeader("SOAPAction", soapAction+url); //optional
				xhr.responseType = "document";
				xhr.onload = async () => {
					// this.hideSpinner();
					if (xhr.status >= 200 && xhr.status < 300) {
						// callback(xhr);
						//this.hideSpinner();
						var oSerializer = new XMLSerializer();
						var sXML = oSerializer.serializeToString(xhr.responseXML.documentElement);
						resolve(sXML);
					} else {
						//	this.hideSpinner();
						resolve(xhr.statusText);
						// callback(xhr)
					}
				};
				xhr.onerror = async () => {
					//	this.hideSpinner();
					// callback(xhr)
					resolve(xhr.statusText);
				};
				xhr.send(param);
			});
		} else {
			this.displayNetworkStatus('Your internet connection appears to be offline !!!');
			return null;
		}
	}
	presentAlert(info) {
		let alert = this.alertController.create({
			title: 'Alert',
			message: info,
			buttons: ['OK']
		});
		alert.present();
	}
	public showSpinner() {
		this.loading.present();
	}

	public hideSpinner() {
		this.loading.dismiss();
	}

	public displayNetworkStatus(msg) {
		let toast = this.toastCtrl.create({
			message: msg,
			duration: 3000,
			position: 'bottom'
		});
		toast.present();
	}

	public convertXmltoJson(data) {
		xml2js.parseString(data, { explicitArray: false }, (error, result) => {
			if (error) {
				throw new Error(error);
			} else {
				console.log(result);
				return result;
			}
		});
	}

}
