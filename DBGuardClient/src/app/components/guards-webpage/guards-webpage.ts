import { Component, inject, OnInit } from '@angular/core';
import { GuardsToolbar } from './guards-toolbar/guards-toolbar';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-guards-webpage',
  imports: [GuardsToolbar, RouterOutlet],
  templateUrl: './guards-webpage.html',
  styleUrl: './guards-webpage.scss',
})
export class GuardsWebpage implements OnInit {
  
  ngOnInit(): void {
    
  }
}
