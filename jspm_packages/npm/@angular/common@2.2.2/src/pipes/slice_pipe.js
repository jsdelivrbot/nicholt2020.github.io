/* */ 
"format cjs";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Pipe } from '@angular/core';
import { isBlank } from '../facade/lang';
import { InvalidPipeArgumentError } from './invalid_pipe_argument_error';
/**
 * @ngModule CommonModule
 * @whatItDoes Creates a new List or String containing a subset (slice) of the elements.
 * @howToUse `array_or_string_expression | slice:start[:end]`
 * @description
 *
 * Where the input expression is a `List` or `String`, and:
 * - `start`: The starting index of the subset to return.
 *   - **a positive integer**: return the item at `start` index and all items after
 *     in the list or string expression.
 *   - **a negative integer**: return the item at `start` index from the end and all items after
 *     in the list or string expression.
 *   - **if positive and greater than the size of the expression**: return an empty list or string.
 *   - **if negative and greater than the size of the expression**: return entire list or string.
 * - `end`: The ending index of the subset to return.
 *   - **omitted**: return all items until the end.
 *   - **if positive**: return all items before `end` index of the list or string.
 *   - **if negative**: return all items before `end` index from the end of the list or string.
 *
 * All behavior is based on the expected behavior of the JavaScript API `Array.prototype.slice()`
 * and `String.prototype.slice()`.
 *
 * When operating on a [List], the returned list is always a copy even when all
 * the elements are being returned.
 *
 * When operating on a blank value, the pipe returns the blank value.
 *
 * ## List Example
 *
 * This `ngFor` example:
 *
 * {@example common/pipes/ts/slice_pipe.ts region='SlicePipe_list'}
 *
 * produces the following:
 *
 *     <li>b</li>
 *     <li>c</li>
 *
 * ## String Examples
 *
 * {@example common/pipes/ts/slice_pipe.ts region='SlicePipe_string'}
 *
 * @stable
 */
export var SlicePipe = (function () {
    function SlicePipe() {
    }
    SlicePipe.prototype.transform = function (value, start, end) {
        if (isBlank(value))
            return value;
        if (!this.supports(value)) {
            throw new InvalidPipeArgumentError(SlicePipe, value);
        }
        return value.slice(start, end);
    };
    SlicePipe.prototype.supports = function (obj) { return typeof obj === 'string' || Array.isArray(obj); };
    SlicePipe.decorators = [
        { type: Pipe, args: [{ name: 'slice', pure: false },] },
    ];
    /** @nocollapse */
    SlicePipe.ctorParameters = [];
    return SlicePipe;
}());
//# sourceMappingURL=slice_pipe.js.map