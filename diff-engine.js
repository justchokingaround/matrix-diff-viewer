/**
 * Diff Engine Module
 * Compares two matrices and identifies changes
 */

class DiffEngine {
    static CHANGE_TYPES = {
        NO_CHANGE: 'no-change',
        TEMPORAL_ONLY: 'temporal-change',
        EXISTENTIAL_ONLY: 'existential-change',
        BOTH: 'both-change',
        ADDED: 'added-cell',
        REMOVED: 'removed-cell',
        EMPTY: 'empty-cell'
    };

    /**
     * Compare two matrix structures and identify changes
     * @param {Object} matrix1 - First matrix structure
     * @param {Object} matrix2 - Second matrix structure
     * @returns {Object} Diff result with change information
     */
    static compare(matrix1, matrix2) {
        // Combine all unique rows and columns from both matrices
        const allRows = this.mergeAndSort(matrix1.rows, matrix2.rows);
        const allCols = this.mergeAndSort(matrix1.cols, matrix2.cols);

        // Create diff map for each cell
        const diffMap = new Map();

        allRows.forEach(row => {
            allCols.forEach(col => {
                const key = `${row}|${col}`;
                const cell1 = YAMLParser.getCell(matrix1.cells, row, col);
                const cell2 = YAMLParser.getCell(matrix2.cells, row, col);

                const changeInfo = this.compareCell(cell1, cell2);
                diffMap.set(key, changeInfo);
            });
        });

        return {
            rows: allRows,
            cols: allCols,
            diffMap,
            matrix1,
            matrix2
        };
    }

    /**
     * Merge and sort two arrays, removing duplicates
     * @param {Array} arr1 - First array
     * @param {Array} arr2 - Second array
     * @returns {Array} Merged sorted array
     */
    static mergeAndSort(arr1, arr2) {
        const merged = new Set([...arr1, ...arr2]);
        return Array.from(merged).sort();
    }

    /**
     * Compare two cells and determine change type
     * @param {Object|null} cell1 - First cell data
     * @param {Object|null} cell2 - Second cell data
     * @returns {Object} Change information
     */
    static compareCell(cell1, cell2) {
        // Case 1: Both cells are null (empty in both matrices)
        if (!cell1 && !cell2) {
            return {
                changeType: this.CHANGE_TYPES.EMPTY,
                cell1: null,
                cell2: null,
                details: null
            };
        }

        // Case 2: Cell only in matrix 2 (added)
        if (!cell1 && cell2) {
            return {
                changeType: this.CHANGE_TYPES.ADDED,
                cell1: null,
                cell2: cell2,
                details: this.createChangeDetails(null, cell2)
            };
        }

        // Case 3: Cell only in matrix 1 (removed)
        if (cell1 && !cell2) {
            return {
                changeType: this.CHANGE_TYPES.REMOVED,
                cell1: cell1,
                cell2: null,
                details: this.createChangeDetails(cell1, null)
            };
        }

        // Case 4: Cell exists in both matrices - check for property changes
        const temporalChanged = this.propertiesChanged(cell1.temporal, cell2.temporal);
        const existentialChanged = this.propertiesChanged(cell1.existential, cell2.existential);

        let changeType;
        if (temporalChanged && existentialChanged) {
            changeType = this.CHANGE_TYPES.BOTH;
        } else if (temporalChanged) {
            changeType = this.CHANGE_TYPES.TEMPORAL_ONLY;
        } else if (existentialChanged) {
            changeType = this.CHANGE_TYPES.EXISTENTIAL_ONLY;
        } else {
            changeType = this.CHANGE_TYPES.NO_CHANGE;
        }

        return {
            changeType,
            cell1,
            cell2,
            details: this.createChangeDetails(cell1, cell2, temporalChanged, existentialChanged)
        };
    }

    /**
     * Check if properties have changed between two objects
     * @param {Object|null} props1 - First properties object
     * @param {Object|null} props2 - Second properties object
     * @returns {boolean} True if properties are different
     */
    static propertiesChanged(props1, props2) {
        // If one is null and other is not, they're different
        if ((!props1 && props2) || (props1 && !props2)) {
            return true;
        }

        // If both are null, no change
        if (!props1 && !props2) {
            return false;
        }

        // Compare each property
        const keys = new Set([
            ...Object.keys(props1 || {}),
            ...Object.keys(props2 || {})
        ]);

        for (const key of keys) {
            if (props1[key] !== props2[key]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Create detailed change information for tooltip
     * @param {Object|null} cell1 - First cell
     * @param {Object|null} cell2 - Second cell
     * @param {boolean} temporalChanged - Whether temporal properties changed
     * @param {boolean} existentialChanged - Whether existential properties changed
     * @returns {string} Formatted change details
     */
    static createChangeDetails(cell1, cell2, temporalChanged = false, existentialChanged = false) {
        const lines = [];

        if (!cell1 && cell2) {
            lines.push('ADDED RELATIONSHIP');
            lines.push('');
            lines.push(`From: ${cell2.from}`);
            lines.push(`To: ${cell2.to}`);
            lines.push('');
            if (cell2.temporal) {
                lines.push('Temporal:');
                lines.push(`  Type: ${cell2.temporal.type || 'N/A'}`);
                lines.push(`  Symbol: ${cell2.temporal.symbol || 'N/A'}`);
                lines.push(`  Direction: ${cell2.temporal.direction || 'N/A'}`);
                lines.push('');
            }
            if (cell2.existential) {
                lines.push('Existential:');
                lines.push(`  Type: ${cell2.existential.type || 'N/A'}`);
                lines.push(`  Symbol: ${cell2.existential.symbol || 'N/A'}`);
                lines.push(`  Direction: ${cell2.existential.direction || 'N/A'}`);
            }
            return lines.join('\n');
        }

        if (cell1 && !cell2) {
            lines.push('REMOVED RELATIONSHIP');
            lines.push('');
            lines.push(`From: ${cell1.from}`);
            lines.push(`To: ${cell1.to}`);
            lines.push('');
            if (cell1.temporal) {
                lines.push('Temporal:');
                lines.push(`  Type: ${cell1.temporal.type || 'N/A'}`);
                lines.push(`  Symbol: ${cell1.temporal.symbol || 'N/A'}`);
                lines.push(`  Direction: ${cell1.temporal.direction || 'N/A'}`);
                lines.push('');
            }
            if (cell1.existential) {
                lines.push('Existential:');
                lines.push(`  Type: ${cell1.existential.type || 'N/A'}`);
                lines.push(`  Symbol: ${cell1.existential.symbol || 'N/A'}`);
                lines.push(`  Direction: ${cell1.existential.direction || 'N/A'}`);
            }
            return lines.join('\n');
        }

        // Both cells exist
        lines.push(`From: ${cell1.from}`);
        lines.push(`To: ${cell1.to}`);
        lines.push('');

        if (temporalChanged || existentialChanged) {
            lines.push('CHANGES DETECTED:');
            lines.push('');
        }

        if (temporalChanged) {
            lines.push('Temporal Properties Changed:');
            lines.push('  BEFORE:');
            if (cell1.temporal) {
                lines.push(`    Type: ${cell1.temporal.type || 'N/A'}`);
                lines.push(`    Symbol: ${cell1.temporal.symbol || 'N/A'}`);
                lines.push(`    Direction: ${cell1.temporal.direction || 'N/A'}`);
            } else {
                lines.push('    (none)');
            }
            lines.push('  AFTER:');
            if (cell2.temporal) {
                lines.push(`    Type: ${cell2.temporal.type || 'N/A'}`);
                lines.push(`    Symbol: ${cell2.temporal.symbol || 'N/A'}`);
                lines.push(`    Direction: ${cell2.temporal.direction || 'N/A'}`);
            } else {
                lines.push('    (none)');
            }
            lines.push('');
        }

        if (existentialChanged) {
            lines.push('Existential Properties Changed:');
            lines.push('  BEFORE:');
            if (cell1.existential) {
                lines.push(`    Type: ${cell1.existential.type || 'N/A'}`);
                lines.push(`    Symbol: ${cell1.existential.symbol || 'N/A'}`);
                lines.push(`    Direction: ${cell1.existential.direction || 'N/A'}`);
            } else {
                lines.push('    (none)');
            }
            lines.push('  AFTER:');
            if (cell2.existential) {
                lines.push(`    Type: ${cell2.existential.type || 'N/A'}`);
                lines.push(`    Symbol: ${cell2.existential.symbol || 'N/A'}`);
                lines.push(`    Direction: ${cell2.existential.direction || 'N/A'}`);
            } else {
                lines.push('    (none)');
            }
        }

        if (!temporalChanged && !existentialChanged) {
            lines.push('No changes detected');
        }

        return lines.join('\n');
    }
}
