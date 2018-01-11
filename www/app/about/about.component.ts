import { Component } from '@angular/core';
import { Inject, Injectable } from '@angular/core';

let template = require('./about.component.html!text');

@Component({
    template:template
})
export class AboutComponent { }