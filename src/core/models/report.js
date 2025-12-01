export default class Report {
    constructor({ reportId, type, generatedAt, summary }) {
        this.reportId = reportId; // ID único del reporte
        this.type = type; // Tipo de reporte: inventory, sales, lowStock, summary
        this.generatedAt = generatedAt || new Date().toISOString(); // Fecha de generación
        this.summary = summary || {}; // Objeto con datos del reporte
    }
}
