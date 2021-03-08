import {Component, Inject, OnInit, AfterViewInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Line, Rule} from '@app/shared/types';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../_services';

@Component({
    selector: 'app-dialog-rule',
    templateUrl: './dialog-rule.component.html',
    styleUrls: ['./dialog-rule.component.less']
})
export class DialogRuleComponent implements AfterViewInit {
    selectedRuleObject: Rule;
    isNewRule = true;
    isEditRule = false;
    toleranceLineForm = 1;
    registered = false;
    submittedSave = false;
    private saveRuleForm: FormGroup;
    isLoading = true;
    lineName = '';

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private apiService: ApiService,
        private dialogRef: MatDialogRef<DialogRuleComponent>) {
        this.saveRuleForm = new FormGroup({
            ruleName: new FormControl(),
            ruleRedTo: new FormControl(),
            ruleYellowFrom: new FormControl(),
            ruleYellowTo: new FormControl(),
            ruleGreenFrom: new FormControl(),
        });
        if (data) {
            this.selectedRuleObject = data;
        }
        this.dialogRef.updateSize('300vw', '300vw');
    }

    ngAfterViewInit() {
        if (!this.selectedRuleObject) {
            this.selectedRuleObject = {
                _id: '',
                ruleName: '',
                ruleRedTo: 0,
                ruleYellowFrom: 0,
                ruleYellowTo: 0,
                ruleGreenFrom: 0
            };
        } else {
            this.saveRuleForm = this.formBuilder.group({
                ruleName: [this.selectedRuleObject.ruleName, Validators.required],
                ruleRedTo: [this.selectedRuleObject.ruleRedTo, Validators.required],
                ruleYellowFrom: [this.selectedRuleObject.ruleYellowFrom, Validators.required],
                ruleYellowTo: [this.selectedRuleObject.ruleYellowTo, Validators.required],
                ruleGreenFrom: [this.selectedRuleObject.ruleGreenFrom, Validators.required],
            });
            // @ts-ignore
            this.saveRuleForm.setValue({
                ruleName: this.selectedRuleObject.ruleName,
                ruleRedTo: this.selectedRuleObject.ruleRedTo,
                ruleYellowFrom: this.selectedRuleObject.ruleYellowFrom,
                ruleYellowTo: this.selectedRuleObject.ruleYellowTo,
                ruleGreenFrom: this.selectedRuleObject.ruleGreenFrom
            });
        }
    }

    close(): void {
        this.dialogRef.close(true);
    }

    update(): void {

    }

    formatRuleObject() {
        this.selectedRuleObject.ruleName = this.saveRuleForm.value.ruleName;
        this.selectedRuleObject.ruleRedTo = this.saveRuleForm.value.ruleRedTo;
        this.selectedRuleObject.ruleYellowFrom = this.saveRuleForm.value.ruleYellowFrom;
        this.selectedRuleObject.ruleYellowTo = this.saveRuleForm.value.ruleYellowTo;
        this.selectedRuleObject.ruleGreenFrom = this.saveRuleForm.value.ruleGreenFrom;
        // delete this.selectedRuleObject._id;
    }

    onSubmitSave() {
        this.submittedSave = true;
        this.formatRuleObject();
        if (this.saveRuleForm.invalid === true) {
            return;
        } else {
            this.registered = true;
            this.apiService.saveEditRuleDb(this.selectedRuleObject).subscribe(data => {
                    console.log('rule saved');
                },
                error => {
                    console.log('error with rule saving', error);
                });
        }
    }
}
