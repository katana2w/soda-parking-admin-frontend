import {Output, EventEmitter, Component, OnInit} from '@angular/core';
import {ApiService} from '../_services';
import { Router } from '@angular/router';
import {Line, Rule} from '../shared/types';

import {MatDialog} from '@angular/material/dialog';
import {DialogMessageComponent} from '../dialog-message/dialog-message.component';
import {DialogRuleComponent} from '../dialog-rule/dialog-rule.component';

@Component({
    selector: 'app-rules',
    templateUrl: './rules.component.html',
    styleUrls: ['./rules.component.less']
})
export class RulesComponent implements OnInit {
    linesSavedArray: Array<Line> = null;
    rulesSavedArray: Array<Rule> = null;

    constructor(
        private apiService: ApiService,
        public dialog: MatDialog,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.apiService.getRulesFromDb().subscribe(responce => {
            if (responce && responce.status === 'Ok') {
                this.rulesSavedArray = responce.data;
                console.log('1', this.rulesSavedArray);
            } else if (responce && responce.status === 'Error') {
                this.openDialog(responce.message);
            }
        });
    }

    openDialog(textMessage): void {
        const dialogRef = this.dialog.open(DialogMessageComponent, {
            width: '500px',
            data: {
                description: textMessage
            },
        });
    }

    openRule(data): void {
        const dialogRef = this.dialog.open(DialogRuleComponent, {
            width: '500px',
            data,
        });
    }

    onRemove(data): void {
        const dialogRef = this.dialog.open(DialogRuleComponent, {
            width: '500px',
            data,
        });
    }

    onNewRule() {
        const dialogRef = this.dialog.open(DialogRuleComponent, {
            width: '500px',
            data: {
                isNewRule: true
            },
        });
    }
}
