import {
  DialogCancellableOpenResult,
  DialogCloseResult,
  DialogOpenPromise,
  DialogService as AureliaDialogService,
  DialogSettings,
} from "aurelia-dialog";
import { autoinject } from "aurelia-framework";
import { ConsoleLogService } from "services/ConsoleLogService";

@autoinject
export class DialogService {

  constructor(
    private dialogService: AureliaDialogService,
    private consoleLogService: ConsoleLogService) {
  }

  public open(
    viewModule: unknown, // result of `import {view} from "path to module files"`
    model: unknown, // object that is given to the module's `activate` function
    settings: DialogSettings = {}): DialogOpenPromise<DialogCancellableOpenResult> {

    //    this.adjustScroll();

    return this.dialogService.open(
      Object.assign({
        model,
        viewModel: viewModule,
      }, settings));
  }
}

export { DialogCloseResult };
