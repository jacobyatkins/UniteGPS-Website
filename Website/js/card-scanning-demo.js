// Wait for DOM and React to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if React and ReactDOM are available
    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
        // Create root element for React
        const root = ReactDOM.createRoot(document.getElementById('card-scanning-demo-root'));

        // CardScanningDemo Component
        const CardScanningDemo = () => {
            const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
            const [availableCards, setAvailableCards] = React.useState([
                { 
                    id: '12345678901', 
                    image: 'https://i.imgur.com/TxFTvK2.png', 
                    name: 'Nadia Martin',
                    grade: '10th',
                    vehicle: 'Bus 101',
                    driver: 'John Smith',
                    stopOrder: '1',
                    studentStop: 'High School of the West'
                },
                { 
                    id: '12345678902', 
                    image: 'https://i.imgur.com/SXa58jM.png', 
                    name: 'Brooke Sanchez',
                    grade: '11th',
                    vehicle: 'Bus 101',
                    driver: 'Sarah Johnson',
                    stopOrder: '2',
                    studentStop: 'High School of the West'
                },
                { 
                    id: '12345678903', 
                    image: 'https://i.imgur.com/NPG7DMY.png', 
                    name: 'Taylor Norton',
                    grade: '9th',
                    vehicle: 'Bus 101',
                    driver: 'Mike Davis',
                    stopOrder: '3',
                    studentStop: 'High School of the West'
                }
            ]);
            const [scannedCards, setScannedCards] = React.useState([]);
            const [scannerActive, setScannerActive] = React.useState(false);
            const [stopCheckRecords, setStopCheckRecords] = React.useState([]);
            const [activeStudent, setActiveStudent] = React.useState(null);

            // Add window resize listener
            React.useEffect(() => {
                const handleResize = () => {
                    setIsMobile(window.innerWidth < 768);
                };

                window.addEventListener('resize', handleResize);
                return () => window.removeEventListener('resize', handleResize);
            }, []);

            // If mobile, don't render the component
            if (isMobile) {
                return null;
            }

            const handleDragStart = (e, card, source) => {
                e.dataTransfer.setData('card', JSON.stringify(card));
                e.dataTransfer.setData('source', source);
            };

            const handleScannerDrop = (e) => {
                e.preventDefault();
                const card = JSON.parse(e.dataTransfer.getData('card'));
                const source = e.dataTransfer.getData('source');
                setScannerActive(true);
                
                // Play beep sound
                const audio = new Audio('sounds/store-scanner-beep-90395.mp3');
                audio.play().catch(error => console.log('Error playing audio:', error));

                const currentTime = new Date();
                
                if (source === 'available') {
                    // Handle pickup
                    const newRecord = {
                        ...card,
                        pickupTime: currentTime,
                        dropoffTime: null,
                        pickupLocation: '5 Hill Rd. Group Stop',
                        dropoffLocation: 'High School of the West'
                    };
                    setStopCheckRecords([newRecord, ...stopCheckRecords]);
                    setActiveStudent(card);
                    setAvailableCards(availableCards.filter(c => c.id !== card.id));
                    setScannedCards([...scannedCards, card]);
                } else if (source === 'scanned') {
                    // Handle dropoff
                    const existingRecordIndex = stopCheckRecords.findIndex(r => r.id === card.id && !r.dropoffTime);
                    if (existingRecordIndex !== -1) {
                        const updatedRecords = [...stopCheckRecords];
                        updatedRecords[existingRecordIndex] = {
                            ...updatedRecords[existingRecordIndex],
                            dropoffTime: currentTime
                        };
                        setStopCheckRecords(updatedRecords);
                    }
                    setActiveStudent(card);
                    setScannedCards(scannedCards.filter(c => c.id !== card.id));
                    setAvailableCards([...availableCards, card]);
                }

                setTimeout(() => {
                    setScannerActive(false);
                    setActiveStudent(null);
                }, 2000);
            };

            const handleCardSectionDrop = (e, targetSection) => {
                e.preventDefault();
                const card = JSON.parse(e.dataTransfer.getData('card'));
                const source = e.dataTransfer.getData('source');

                if (source !== targetSection) {
                    if (targetSection === 'available') {
                        setScannedCards(scannedCards.filter(c => c.id !== card.id));
                        setAvailableCards([...availableCards, card]);
                    } else if (targetSection === 'scanned') {
                        setAvailableCards(availableCards.filter(c => c.id !== card.id));
                        setScannedCards([...scannedCards, card]);
                    }
                }
            };

            const handleDragOver = (e) => {
                e.preventDefault();
            };

            const renderCard = (card, source) => {
                return React.createElement('div', {
                    key: card.id,
                    draggable: true,
                    onDragStart: (e) => handleDragStart(e, card, source),
                    className: 'cursor-pointer transition hover:shadow-lg',
                    style: { cursor: 'grab' }
                },
                    React.createElement('img', {
                        src: card.image,
                        alt: card.name,
                        className: 'img-fluid rounded shadow-sm',
                        style: { maxWidth: '240px' }
                    })
                );
            };

            const StopCheckTable = () => {
                return React.createElement('div', { 
                    className: 'bg-white rounded p-2'
                },
                    React.createElement('table', { 
                        className: 'table table-sm',
                        style: { tableLayout: 'fixed', width: '100%' }
                    },
                        React.createElement('thead', null,
                            React.createElement('tr', { className: 'border-bottom border-gray-200' },
                                React.createElement('th', { style: { position: 'relative', width: '120px', textAlign: 'left', padding: '8px 0' } }, 'Student'),
                                React.createElement('th', { style: { position: 'relative', width: '100px', textAlign: 'left', padding: '8px 0' } }, 'Grade'),
                                React.createElement('th', { style: { position: 'relative', width: '100px', textAlign: 'left', padding: '8px 0' } }, 'Vehicle'),
                                React.createElement('th', { style: { position: 'relative', width: '100px', textAlign: 'left', padding: '8px 0' } }, 'Pick Up'),
                                React.createElement('th', { style: { position: 'relative', width: '100px', textAlign: 'left', padding: '8px 0' } }, 'Drop Off')
                            )
                        ),
                        React.createElement('tbody', null,
                            stopCheckRecords.map((record, index) =>
                                React.createElement('tr', { 
                                    key: `${record.id}-${index}`,
                                    className: `${record.pickupTime && !record.dropoffTime ? 'table-success' : ''} ${record.dropoffTime ? 'table-danger' : ''} ${index === 0 && activeStudent ? 'table-success' : ''}`,
                                    style: { width: '100%' }
                                },
                                    React.createElement('td', { style: { width: '120px', padding: '8px 0' } }, record.name),
                                    React.createElement('td', { style: { width: '100px', padding: '8px 0' } }, record.grade),
                                    React.createElement('td', { style: { width: '100px', padding: '8px 0' } }, record.vehicle),
                                    React.createElement('td', { style: { width: '100px', padding: '8px 0' } },
                                        record.pickupTime && React.createElement('div', null,
                                            React.createElement('div', null, 
                                                new Date(record.pickupTime).toLocaleTimeString('en-US', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit',
                                                    hour12: true 
                                                })
                                            ),
                                            React.createElement('div', { className: 'text-muted small' }, 
                                                new Date(record.pickupTime).toLocaleDateString('en-US', {
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                })
                                            ),
                                            React.createElement('div', { className: 'text-muted small' }, 
                                                '5 Hill Rd. Group Stop'
                                            )
                                        )
                                    ),
                                    React.createElement('td', { style: { width: '100px', padding: '8px 0' } },
                                        record.dropoffTime && React.createElement('div', null,
                                            React.createElement('div', null, 
                                                new Date(record.dropoffTime).toLocaleTimeString('en-US', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit',
                                                    hour12: true 
                                                })
                                            ),
                                            React.createElement('div', { className: 'text-muted small' }, 
                                                new Date(record.dropoffTime).toLocaleDateString('en-US', {
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                })
                                            ),
                                            React.createElement('div', { className: 'text-muted small' }, 
                                                'High School of the West'
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                );
            };

            return React.createElement('section', { className: 'bg-white py-4' },
                React.createElement('div', { className: 'container' },
                    React.createElement('div', { className: 'row' },
                        // ID Cards Section - Left
                        React.createElement('div', { className: 'col-3' },
                            React.createElement('h5', { className: 'text-center mb-3' }, 'Unboarded Students'),
                            React.createElement('div', {
                                className: 'd-flex flex-column gap-2',
                                onDrop: (e) => handleCardSectionDrop(e, 'available'),
                                onDragOver: handleDragOver,
                                style: { paddingRight: '20px' }
                            },
                                availableCards.map(card => renderCard(card, 'available'))
                            )
                        ),
                        // Scanner and Stop Check Report Section
                        React.createElement('div', { className: 'col-6' },
                            React.createElement('div', {
                                className: `d-flex flex-column align-items-center justify-content-center p-3 rounded ${
                                    scannerActive ? 'bg-light' : ''
                                }`,
                                onDrop: handleScannerDrop,
                                onDragOver: handleDragOver,
                                style: { minHeight: '200px' }
                            },
                                React.createElement('img', {
                                    src: 'https://i.imgur.com/vIHZjDo.png',
                                    alt: 'Scanner',
                                    className: 'img-fluid mb-2',
                                    style: { maxWidth: '160px' }
                                }),
                                React.createElement('p', { className: 'small text-muted mb-0' }, 
                                    'Drop ID card here to scan'
                                )
                            ),
                            React.createElement('div', { className: 'mt-3' },
                                React.createElement('h6', { className: 'text-center mb-2' }, 'Stop Check Report'),
                                React.createElement(StopCheckTable)
                            )
                        ),
                        // Display Section
                        React.createElement('div', { className: 'col-3' },
                            React.createElement('h5', { className: 'text-center mb-3' }, 'Boarded Students'),
                            React.createElement('div', {
                                className: 'd-flex flex-column gap-2',
                                onDrop: (e) => handleCardSectionDrop(e, 'scanned'),
                                onDragOver: handleDragOver,
                                style: { paddingLeft: '20px', minHeight: '150px' }
                            },
                                scannedCards.length > 0
                                    ? scannedCards.map(card => renderCard(card, 'scanned'))
                                    : React.createElement('p', { className: 'text-muted mb-0 text-center' },
                                        'Waiting for card scan...'
                                    )
                            )
                        )
                    )
                )
            );
        };

        // Render the component
        root.render(React.createElement(CardScanningDemo));
    } else {
        console.error('React or ReactDOM not loaded');
    }
});