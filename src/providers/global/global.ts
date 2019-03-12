import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from '../../models/item';
import * as _ from 'lodash';
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
  constructor(public http: HttpClient) {
    console.log('Hello GlobalProvider Provider');
    this.http.get("../../assets/config/config.xml", { responseType: 'text' }).subscribe(data => {
			let parser = new DOMParser();
			let doc = parser.parseFromString(data, "application/xml");
			  var AppVersion = doc.getElementsByTagName("AppVersion")[0].textContent as string;
				this.buildNum = AppVersion;
		})
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
