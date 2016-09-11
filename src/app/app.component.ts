import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { List } from 'immutable';

import { PAUSE, RESUME } from './core/actions';
import { AppState } from './core/app-state.model';
import { PlayerState } from './core/player-state.model';
import { PulseService } from './core/pulse.service';
import { AudioPlayerService } from './audio/audio-player.service';

@Component({
  selector: 'in-c-app',
  template: `
    <div #container class="container" (click)="audioPlayer.enableAudioContext()">
      <in-c-background class="background"
                       [nowPlaying]="nowPlaying$ | async"
                       [screenWidth]="width"
                       [screenHeight]="height">
      </in-c-background>
      <svg class="foreground"
           [attr.width]="width"
           [attr.height]="height"
           [attr.viewBox]="'0 0 ' + width + ' ' + height">
        <svg:g in-c-player
               *ngFor="let playerState of players$ | async; trackBy: trackPlayer"
               [playerState]="playerState"
               [playerStats]="stats$ | async"
               [screenWidth]="width"
               [screenHeight]="height">
        </svg:g>
      </svg>
    </div>
    <in-c-top-bar [paused]="paused$ | async"
                  (pause)="pause()"
                  (resume)="resume()">
    </in-c-top-bar>
  `,
  styles: [`
    .container, .background, .foreground {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {

  paused$ = this.store.select('paused').distinctUntilChanged();
  players$ = this.store.select('players');
  nowPlaying$ = this.store.select('nowPlaying');
  stats$ = this.store.select('stats');

  @ViewChild('container') containerRef: ElementRef;
  width = 0;
  height = 0;

  constructor(private store: Store<AppState>,
              private pulse: PulseService,
              private audioPlayer: AudioPlayerService) {
  }

  ngOnInit() {
    this.pulse.onInit();
    this.setSize();
  }

  ngOnDestroy() {
    this.pulse.onDestroy();
  }

  @HostListener('window:resize')
  setSize() {
    this.width = this.containerRef.nativeElement.offsetWidth;
    this.height = this.containerRef.nativeElement.offsetHeight;
  }

  trackPlayer(index: number, obj: PlayerState): any {
    return obj.player.instrument;
  }

  pause() {
    this.store.dispatch({type: PAUSE});
  }

  resume() {
    this.store.dispatch({type: RESUME});
  }

}
