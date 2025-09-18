const countries = require('./countries');

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'warning';
        case 'in_transit':
        case 'in-transit':
            return 'info';
        case 'delivered':
            return 'success';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

function formatStatus(status) {
    if (!status) return 'N/A';
    
    const statusMap = {
        'pending': 'Pendente',
        'in_transit': 'Em Trânsito',
        'in-transit': 'Em Trânsito',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado',
        'document': 'Documento',
        'parcel': 'Encomenda',
        'cargo': 'Carga',
        'express': 'Expresso',
        'box': 'Caixa',
        'carton': 'Papelão',
        'crate': 'Engradado',
        'pallet': 'Palete',
        'tube': 'Tubo',
        'roll': 'Rolo',
        'envelope': 'Envelope'
    };

    return statusMap[status.toLowerCase()] || status;
}

function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getCountryName(code) {
    if (!code) return '';
    const country = countries.find(c => c.code === code.toUpperCase());
    return country ? country.name : code;
}

module.exports = {
    getStatusBadgeClass,
    formatStatus,
    formatDate,
    getCountryName
};