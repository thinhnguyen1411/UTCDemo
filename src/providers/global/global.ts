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

  constructor(public http: HttpClient) {
    console.log('Hello GlobalProvider Provider');
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
