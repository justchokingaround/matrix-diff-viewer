/**
 * YAML Parser Module
 * Parses YAML files containing relationship data and converts them to matrix structure
 */

class YAMLParser {
    /**
     * Parse YAML content and convert to structured data
     * @param {string} yamlContent - Raw YAML content
     * @returns {Object} Parsed matrix data
     */
    static parse(yamlContent) {
        try {
            // Parse YAML using js-yaml library
            const data = jsyaml.load(yamlContent);

            // Check if data has the proper structure with dependencies key
            let relationships;
            if (data && data.dependencies && Array.isArray(data.dependencies)) {
                relationships = data.dependencies;
            } else if (Array.isArray(data)) {
                // Fallback for simple array format
                relationships = data;
            } else {
                throw new Error('YAML must contain a "dependencies" array or be an array of relationships');
            }

            return this.buildMatrixStructure(relationships);
        } catch (error) {
            throw new Error(`Failed to parse YAML: ${error.message}`);
        }
    }

    /**
     * Build matrix structure from relationship array
     * @param {Array} relationships - Array of from-to relationships
     * @returns {Object} Matrix structure with rows, columns, and cells
     */
    static buildMatrixStructure(relationships) {
        const rowSet = new Set();
        const colSet = new Set();
        const cellMap = new Map();

        // Extract all unique 'from' and 'to' nodes
        relationships.forEach(rel => {
            if (!rel.from || !rel.to) {
                console.warn('Skipping relationship missing from/to:', rel);
                return;
            }

            rowSet.add(rel.from);
            colSet.add(rel.to);

            // Store cell data using "from|to" as key
            const key = `${rel.from}|${rel.to}`;
            cellMap.set(key, {
                from: rel.from,
                to: rel.to,
                temporal: rel.temporal || null,
                existential: rel.existential || null
            });
        });

        // Convert sets to sorted arrays for consistent ordering
        const rows = Array.from(rowSet).sort();
        const cols = Array.from(colSet).sort();

        return {
            rows,
            cols,
            cells: cellMap,
            relationships
        };
    }

    /**
     * Get cell data for a specific from-to pair
     * @param {Map} cellMap - Map of cell data
     * @param {string} from - From node
     * @param {string} to - To node
     * @returns {Object|null} Cell data or null if not exists
     */
    static getCell(cellMap, from, to) {
        const key = `${from}|${to}`;
        return cellMap.get(key) || null;
    }

    /**
     * Create a readable string representation of temporal/existential properties
     * @param {Object} temporal - Temporal properties
     * @param {Object} existential - Existential properties
     * @returns {string} Formatted string
     */
    static formatCellContent(temporal, existential) {
        const parts = [];

        if (temporal && temporal.symbol) {
            parts.push(temporal.symbol);
        }

        if (existential && existential.symbol) {
            parts.push(existential.symbol);
        }

        return parts.length > 0 ? parts.join(' ') : '';
    }

    /**
     * Create detailed tooltip content for a cell
     * @param {Object} cellData - Cell data with temporal and existential properties
     * @returns {string} Tooltip text
     */
    static createTooltipContent(cellData) {
        if (!cellData) return 'Empty cell';

        const lines = [];
        lines.push(`From: ${cellData.from}`);
        lines.push(`To: ${cellData.to}`);
        lines.push('');

        if (cellData.temporal) {
            lines.push('Temporal:');
            lines.push(`  Type: ${cellData.temporal.type || 'N/A'}`);
            lines.push(`  Symbol: ${cellData.temporal.symbol || 'N/A'}`);
            lines.push(`  Direction: ${cellData.temporal.direction || 'N/A'}`);
            lines.push('');
        }

        if (cellData.existential) {
            lines.push('Existential:');
            lines.push(`  Type: ${cellData.existential.type || 'N/A'}`);
            lines.push(`  Symbol: ${cellData.existential.symbol || 'N/A'}`);
            lines.push(`  Direction: ${cellData.existential.direction || 'N/A'}`);
        }

        return lines.join('\n');
    }
}
