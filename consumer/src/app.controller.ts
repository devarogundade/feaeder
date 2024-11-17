/* eslint-disable prettier/prettier */

import { Body, Controller, Get, Post, Query } from '@nestjs/common';  // Importing necessary decorators from NestJS
import { AppService } from './app.service';  // Service layer to handle business logic
import { Aggregator } from './database/schemas/aggregator';  // Aggregator schema model for DB operations
import { Datafeed } from './database/schemas/datafeed';  // Datafeed schema model for DB operations
import { Paged } from './types';  // Paged type for paginated responses

@Controller()  // NestJS controller that maps incoming requests to methods
export class AppController {
  constructor(private readonly appService: AppService) { }  // Injecting the AppService to access business logic

  // POST endpoint to restart the system or service by calling the restart method in AppService
  @Post('/restart')
  restart(): Promise<Aggregator[]> {
    return this.appService.restart();  // Calls the restart method to reset or refresh aggregators
  }

  // POST endpoint to add a new aggregator to the system
  @Post('/add-aggregator')
  addAggregator(
    @Body() aggregator: Aggregator  // The body of the request contains the aggregator object
  ): Promise<Aggregator> {
    return this.appService.addAggregator(aggregator);  // Adds the new aggregator through the AppService
  }

  // GET endpoint to fetch all aggregators, with pagination support via page number
  @Get('/aggregators')
  getAggregators(
    @Query('page') page: number,  // Retrieves the page number from the URL
    @Query('category') category: string,  // Retrieves the category filter from the URL (optional
    @Query('search') search: string  // Retrieves the search filter from the URL (optional)
  ): Promise<Paged<Aggregator[]>> {
    return this.appService.getAggregators(page, category, search);  // Fetches paginated aggregators from the AppService
  }

  // GET endpoint to fetch all datafeeds, with pagination support via page number
  @Get('/datafeeds')
  getDatafeeds(
    @Query('page') page: number  // Retrieves the page number from the URL
  ): Promise<Paged<Datafeed[]>> {
    return this.appService.getDatafeeds(page);  // Fetches paginated datafeeds from the AppService
  }

  // GET endpoint to fetch datafeeds associated with a specific aggregator, with pagination support
  @Get('/aggregators-datafeeds')
  getAggregatorDatafeeds(
    @Query('aggregator') aggregator: string,  // Retrieves the aggregator address or ID
    @Query('page') page: number  // Retrieves the page number from the URL
  ): Promise<Paged<Datafeed[]>> {
    return this.appService.getAggregatorDatafeeds(aggregator, page);  // Fetches paginated datafeeds for the specified aggregator
  }
}
