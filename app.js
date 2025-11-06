/**
 * Main Application Module
 * Orchestrates file upload, parsing, diff calculation, and rendering
 */

class MatrixDiffApp {
    constructor() {
        this.file1 = null;
        this.file2 = null;
        this.matrix1 = null;
        this.matrix2 = null;
        this.currentView = 1; // 1 for "Before", 2 for "After"

        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for UI elements
     */
    initializeEventListeners() {
        const file1Input = document.getElementById('file1');
        const file2Input = document.getElementById('file2');
        const compareBtn = document.getElementById('compareBtn');
        const matrixToggle = document.getElementById('matrixToggle');

        file1Input.addEventListener('change', (e) => this.handleFileSelect(e, 1));
        file2Input.addEventListener('change', (e) => this.handleFileSelect(e, 2));
        compareBtn.addEventListener('click', () => this.compareMatrices());
        matrixToggle.addEventListener('change', (e) => this.handleToggle(e));
    }

    /**
     * Handle file selection
     * @param {Event} event - File input change event
     * @param {number} fileNum - File number (1 or 2)
     */
    handleFileSelect(event, fileNum) {
        const file = event.target.files[0];
        const filenameDisplay = document.getElementById(`filename${fileNum}`);

        if (file) {
            if (fileNum === 1) {
                this.file1 = file;
            } else {
                this.file2 = file;
            }

            filenameDisplay.textContent = file.name;
            filenameDisplay.style.color = '#10b981';
            filenameDisplay.style.fontStyle = 'normal';
        } else {
            if (fileNum === 1) {
                this.file1 = null;
            } else {
                this.file2 = null;
            }

            filenameDisplay.textContent = 'No file selected';
            filenameDisplay.style.color = '#71717a';
            filenameDisplay.style.fontStyle = 'italic';
        }

        // Enable compare button only if both files are selected
        this.updateCompareButton();
    }

    /**
     * Update compare button state
     */
    updateCompareButton() {
        const compareBtn = document.getElementById('compareBtn');
        compareBtn.disabled = !(this.file1 && this.file2);
    }

    /**
     * Handle toggle between matrices
     * @param {Event} event - Toggle change event
     */
    handleToggle(event) {
        const isChecked = event.target.checked;
        this.currentView = isChecked ? 2 : 1;

        // Update title
        const title = document.getElementById('matrixTitle');
        title.textContent = isChecked ? 'Matrix 2 (After)' : 'Matrix 1 (Before)';

        // Re-render with new matrix
        const container = document.getElementById('matrixContainer');
        MatrixRenderer.toggleMatrix(container, this.currentView);
    }

    /**
     * Compare matrices
     */
    async compareMatrices() {
        this.hideError();
        this.hideMatrix();

        try {
            // Read and parse both files
            const content1 = await this.readFile(this.file1);
            const content2 = await this.readFile(this.file2);

            this.matrix1 = YAMLParser.parse(content1);
            this.matrix2 = YAMLParser.parse(content2);

            // Perform diff
            const diffResult = DiffEngine.compare(this.matrix1, this.matrix2);

            // Reset toggle to show matrix 1 (Before)
            const matrixToggle = document.getElementById('matrixToggle');
            matrixToggle.checked = false;
            this.currentView = 1;

            // Update title
            const title = document.getElementById('matrixTitle');
            title.textContent = 'Matrix 1 (Before)';

            // Render matrix
            const container = document.getElementById('matrixContainer');
            MatrixRenderer.render(diffResult, container, this.currentView);

            // Show results
            this.showMatrix();
            this.showLegend();

            // Display statistics
            const stats = MatrixRenderer.getStatistics(diffResult);
            this.displayStatistics(stats);
            console.log('Diff Statistics:', stats);

        } catch (error) {
            this.showError(error.message);
            console.error('Error comparing matrices:', error);
        }
    }

    /**
     * Read file contents
     * @param {File} file - File to read
     * @returns {Promise<string>} File contents
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve(e.target.result);
            };

            reader.onerror = (e) => {
                reject(new Error(`Failed to read file: ${file.name}`));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');

        errorMessage.textContent = message;
        errorSection.style.display = 'block';
    }

    /**
     * Hide error message
     */
    hideError() {
        const errorSection = document.getElementById('errorSection');
        errorSection.style.display = 'none';
    }

    /**
     * Show matrix section
     */
    showMatrix() {
        const matrixSection = document.getElementById('matrixSection');
        matrixSection.style.display = 'flex';
    }

    /**
     * Hide matrix section
     */
    hideMatrix() {
        const matrixSection = document.getElementById('matrixSection');
        matrixSection.style.display = 'none';
    }

    /**
     * Show legend section
     */
    showLegend() {
        const legendSection = document.getElementById('statsLegendSection');
        legendSection.style.display = 'grid';
    }

    /**
     * Hide legend section
     */
    hideLegend() {
        const legendSection = document.getElementById('statsLegendSection');
        legendSection.style.display = 'none';
    }

    /**
     * Display statistics
     * @param {Object} stats - Statistics object
     */
    displayStatistics(stats) {
        // Calculate non-empty relationships
        const totalRelationships = stats.total - stats.empty;

        document.getElementById('statTotal').textContent = totalRelationships;
        document.getElementById('statTemporal').textContent = stats.temporalOnly;
        document.getElementById('statExistential').textContent = stats.existentialOnly;
        document.getElementById('statBoth').textContent = stats.both;
        document.getElementById('statAdded').textContent = stats.added;
        document.getElementById('statRemoved').textContent = stats.removed;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new MatrixDiffApp();
    console.log('Matrix Diff Viewer initialized');
});
