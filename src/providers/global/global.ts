import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from '../../models/item';
import * as _ from 'lodash';
import { AppVersion } from '@ionic-native/app-version';
import { Platform } from 'ionic-angular';
/*
  Generated class for the GlobalProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GlobalProvider {
  public loginUser: string;
  public isDebug: boolean = false;
  public buildNum:string = "";
  constructor(public http: HttpClient,private appVersion: AppVersion,public platform: Platform) {
    try {

      if (this.platform.is('mobileweb') || this.platform.is('core')) {
        // This will only print when running on desktop
        console.log("I'm a regular browser!");
        this.http.get("../../assets/config/custom_config.xml", { responseType: 'text' }).subscribe(data => {
          let parser = new DOMParser();
          let doc = parser.parseFromString(data, "application/xml");
            var AppVersion = doc.getElementsByTagName("AppVersion")[0].textContent as string;
            this.buildNum = AppVersion;
        })
    
      }
      else
      {
        this.appVersion.getVersionNumber().then(version => {
                this.buildNum = version;
                });
      }
      } catch (error) {
        alert(error);
      }
  }


  getPaginatedItems(items, page, pageSize) {
    const pg = page || 1,
      pgSize = pageSize || 100,
      offset = (pg - 1) * pgSize,
      pagedItems = _.drop(items, offset).slice(0, pgSize);
    return {
      page: pg,
      pageSize: pgSize,
      total: items.length,
      total_pages: Math.ceil(items.length / pgSize),
      data: pagedItems
    };
  }

}
