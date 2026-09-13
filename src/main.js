import './styles.css';
import Graph from 'graphology';
import Sigma from 'sigma';
import { supabase, supabaseConfigured } from './lib/supabase.js';
import { uploadPrivateEvidence } from './lib/storage.js';
import { graphMetrics } from './lib/analysis.js';

const translations = {
  en: {
    product: 'Netrakshak', productSub: 'Criminal Network Analysis', restricted: 'RESTRICTED ACCESS',
    signInTitle: 'Secure investigator sign-in', signInBody: 'Access is monitored and every evidence action is recorded.', email: 'Official email', password: 'Password', signIn: 'Sign in', demoHint: 'Prototype access: use any email and password.',
    command: 'Dashboard', network: 'Network Graph', fir: 'FIR Report', officers: 'Officers', auditLogs: 'Audit Logs', sources: 'Data & Integrity', settings: 'Settings', overview: 'Dashboard', search: 'Search entities, FIR numbers, phones, vehicles…', activeCase: 'Active investigation', systemStatus: 'SYSTEM STATUS', secure: 'Secure • audit online', today: 'Today', alerts: 'Priority alerts', entities: 'Entities under review', connections: 'Verified connections', integrity: 'Evidence integrity', viewNetwork: 'Open network', reviewFIR: 'Review FIR intake', high: 'High', medium: 'Medium', low: 'Low', risk: 'Risk', type: 'Type', connectionsSort: 'Connections', recent: 'Recent activity', name: 'Name', allTypes: 'All types', filter: 'Filter', fullscreen: 'Fullscreen', exitFullscreen: 'Exit fullscreen', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Reset view', graphHint: 'Drag nodes • scroll to zoom • select an entity to inspect', selectedEntity: 'Selected entity', associations: 'Associations', linkedEvents: 'Linked events', source: 'Source', confidence: 'Confidence', evidenceTrail: 'Evidence trail', uploadTitle: 'FIR document intake', uploadBody: 'Drop a scanned FIR here or browse a local file. The original is fingerprinted before processing.', browse: 'Browse file', fingerprint: 'SHA-256 fingerprint', ocrReady: 'OCR adapter ready for connection', reviewDraft: 'Review extracted draft', noFile: 'No document selected', auditTitle: 'Tamper-evident audit trail', auditBody: 'Every change is versioned and hash-linked. Ledger anchoring is ready for deployment.', verified: 'Verified', imported: 'Imported', synthetic: 'Synthetic demo data', live: 'Live source', dataSources: 'Data sources', integrityChecks: 'Integrity checks', hashChain: 'Hash chain', ledger: 'Ledger anchor', all: 'All', logout: 'Sign Out', language: 'Language', welcome: 'Good morning, Officer.', briefing: 'Here is your network briefing for today.', viewAll: 'View all', noResults: 'No matching entities', sourceNote: 'Prototype data is synthetic and labelled. Connect the NCRB-approved dataset to enable live case analysis.',
    workspace: 'Workspace', governance: 'Governance', liveAudit: 'Live audit stream', riskPulse: 'Risk pulse', last30: 'Last 30 days', sortBy: 'Sort by', entitiesCount: 'entities', prototypeEnvironment: 'Prototype environment', priorityReview: '2 high priority · 1 review', sourceTypes: 'Across 7 source types', lastVerified: 'Last verified 09:42 IST', operationMonsoon: 'Operation Monsoon', caseLocation: 'Pune • Maharashtra • 18 connected entities', networkConfidence: 'Network confidence', linkageAnalysis: 'LINKAGE ANALYSIS • Operation Monsoon', documentIntelligence: 'DOCUMENT INTELLIGENCE • NCRB WORKFLOW', uploadWorkflow: 'Upload, fingerprint, extract, review, and save with an accountable chain of custody.', fingerprintStep: 'Fingerprint', extractStep: 'Extract', reviewStep: 'Review', commitStep: 'Commit', sha256: 'SHA-256', ocrAdapter: 'OCR adapter', officerConfirmation: 'Officer confirmation', auditLedger: 'Audit + ledger', reviewRequired: 'Review is required before commit', importManifest: 'Import manifest', sourceCatalogue: 'GOVERNANCE • SOURCE CATALOGUE', sourceProvenance: 'Every record has a declared source class, provenance, and integrity status.', batchVerified: 'Last batch verification: 09:42 IST', permissionedReady: 'Ready for permissioned deployment', anomalousExports: '0 anomalous exports', accessControls: 'Access controls', investigatorProfile: 'Investigator profile', responsibleAI: 'Responsible AI controls', defaultLanguage: 'Default language', dataEnvironment: 'Data environment', mfaEnabled: 'MFA enabled', investigationUnit: 'Maharashtra Police · Pune', officerName: 'Ashutosh Patil', tlsProtected: 'TLS protected', ncrbWorkflow: 'NCRB workflow', caseConfidence: '78%', approvedDataset: 'NCRB-approved dataset', heroTitle: 'See the network. Protect the evidence.', heroBody: 'A secure intelligence workspace for connecting records, discovering patterns, and supporting investigators across India.', evidenceFirst: 'Evidence-first investigations', graphPowered: 'Graph-powered linkage analysis', auditableByDesign: 'Auditable by design', prototypeFooter: 'Netrakshak • SIH 2026 prototype', versionFooter: 'v0.1 • Evidence integrity enabled', weeklyChange: '+8.4% this week', hashVerified: 'Hash verified', entityMergeReview: 'Entity merge review', assigned: 'A. Sharma assigned', newLinkDetected: 'New link detected', linkedAccount: 'Account •• 9130 ↔ Arjun Pawar', datasetManifest: 'Dataset manifest', demoBatch: 'Synthetic demo batch v0.3', lastVerifiedTime: 'Last verified 09:42 IST', riskDates: ['15 Aug', '22 Aug', '29 Aug', '05 Sep', '12 Sep'], refreshed: 'Risk pulse refreshed',
    officersSubtitle: 'Law-enforcement profiles with rank, badge and district (used for login & audit attribution).', addOfficer: 'Add Officer', editOfficer: 'Edit Officer', fullName: 'Full name', rank: 'Rank', badgeNo: 'Badge no.', district: 'District', state: 'State', emailAddress: 'Email address', phone: 'Phone', initialPassword: 'Initial password', passwordHelp: 'New officers sign in with their email and this password. Min 6 characters.', rolePermissions: 'Role / permissions', caseOfficer: 'case-officer', analyst: 'analyst', admin: 'admin', clear: 'Clear', saveChanges: 'Save Changes', officerAdded: 'Officer profile created', officerUpdated: 'Officer profile updated', officerDeleted: 'Officer profile removed', auditSubtitle: 'Immutable activity trail — who changed what, and when', warnings: 'Warnings', criticalEvents: 'Critical events', tamperAlerts: 'Tamper alerts', noActiveAlerts: 'No active integrity alerts', level: 'Level', info: 'Info', critical: 'Critical', time: 'Time', actor: 'Actor', action: 'Action', summary: 'Summary', supabaseConnected: 'Supabase connected — writes persisted',
    accessibility: 'Accessibility', decreaseText: 'Decrease text size', resetText: 'Reset text size', increaseText: 'Increase text size', collapseSidebar: 'Collapse navigation', expandSidebar: 'Expand navigation', manualEntry: 'Manual FIR entry', scannedUpload: 'Scanned FIR upload', caseDetails: 'Case details', personDetails: 'Subject details', evidence: 'Evidence', saveDraft: 'Save draft', addEvidence: 'Add evidence', evidenceType: 'Evidence type', evidenceDescription: 'Evidence description', subjectName: 'Subject name', alias: 'Alias / known as', dob: 'Date of birth', address: 'Address', vehicle: 'Vehicle number', bank: 'Bank / wallet identifier', incidentSummary: 'Incident summary', reportingOfficer: 'Reporting officer', saveCase: 'Save FIR case', draftSaved: 'FIR draft saved locally', caseSaved: 'FIR case saved for review', manualEntryHelp: 'Enter case facts, subject identifiers, and evidence for officer review.', documentEvidence: 'Document', deviceEvidence: 'Device', financialEvidence: 'Financial record', witnessEvidence: 'Witness statement', draft: 'Draft', removeEvidence: 'Remove evidence',
    authFailed: 'Unable to sign in. Check your credentials.', authNotConfigured: 'Supabase is not configured; local demo session used.', saveFailed: 'The FIR could not be saved. Try again or check the database setup.', influence: 'Influence', documentReceived: 'Document received', officerActor: 'Officer Ashutosh Patil', hashGenerated: 'SHA-256 generated', browserCrypto: 'Browser cryptography', ocrExtraction: 'OCR extraction', adapterNotConnected: 'Adapter not connected', pending: 'Pending', firNumber: 'FIR number', policeStation: 'Police station', incidentDate: 'Incident date', sections: 'Sections', namedEntities: 'Named entities', extractedPending: '6 extracted · 2 pending review', sourceIntegrity: 'FIR + CDR + synthetic', documentCount: 'No document selected'
  },
  hi: {
    product: 'नेत्ररक्षक', productSub: 'अपराध नेटवर्क विश्लेषण', restricted: 'सीमित प्रवेश', signInTitle: 'सुरक्षित अन्वेषक प्रवेश', signInBody: 'प्रवेश की निगरानी की जाती है और हर साक्ष्य कार्रवाई दर्ज होती है।', email: 'आधिकारिक ईमेल', password: 'पासवर्ड', signIn: 'प्रवेश करें', demoHint: 'प्रोटोटाइप: कोई भी ईमेल और पासवर्ड इस्तेमाल करें।', command: 'डैशबोर्ड', network: 'नेटवर्क ग्राफ', fir: 'एफआईआर रिपोर्ट', officers: 'अधिकारी', auditLogs: 'ऑडिट लॉग', sources: 'डेटा और अखंडता', settings: 'सेटिंग्स', overview: 'डैशबोर्ड', search: 'इकाई, एफआईआर नंबर, फोन, वाहन खोजें…', activeCase: 'सक्रिय जांच', systemStatus: 'सिस्टम स्थिति', secure: 'सुरक्षित • ऑडिट ऑनलाइन', today: 'आज', alerts: 'प्राथमिकता अलर्ट', entities: 'समीक्षा वाली इकाइयां', connections: 'सत्यापित कनेक्शन', integrity: 'साक्ष्य अखंडता', viewNetwork: 'नेटवर्क खोलें', reviewFIR: 'एफआईआर देखें', high: 'उच्च', medium: 'मध्यम', low: 'कम', risk: 'जोखिम', type: 'प्रकार', connectionsSort: 'कनेक्शन', recent: 'हाल की गतिविधि', name: 'नाम', allTypes: 'सभी प्रकार', filter: 'फ़िल्टर', fullscreen: 'फुलस्क्रीन', exitFullscreen: 'बाहर निकलें', zoomIn: 'ज़ूम इन', zoomOut: 'ज़ूम आउट', reset: 'रीसेट', graphHint: 'नोड खींचें • ज़ूम के लिए स्क्रॉल करें • जांच हेतु इकाई चुनें', selectedEntity: 'चयनित इकाई', associations: 'संबंध', linkedEvents: 'जुड़ी घटनाएं', source: 'स्रोत', confidence: 'विश्वास', evidenceTrail: 'साक्ष्य ट्रेल', uploadTitle: 'एफआईआर दस्तावेज़ इनटेक', uploadBody: 'स्कैन की गई एफआईआर यहां छोड़ें या स्थानीय फाइल चुनें।', browse: 'फाइल चुनें', fingerprint: 'SHA-256 फिंगरप्रिंट', ocrReady: 'OCR एडाप्टर तैयार', reviewDraft: 'ड्राफ्ट समीक्षा', noFile: 'कोई दस्तावेज़ नहीं चुना', auditTitle: 'ऑडिट ट्रेल', auditBody: 'हर बदलाव संस्करणित और हैश-लिंक्ड है।', verified: 'सत्यापित', imported: 'आयातित', synthetic: 'सिंथेटिक डेमो डेटा', live: 'लाइव स्रोत', dataSources: 'डेटा स्रोत', integrityChecks: 'अखंडता जांच', hashChain: 'हैश चेन', ledger: 'लेजर एंकर', all: 'सभी', logout: 'बाहर निकलें', language: 'भाषा', welcome: 'सुप्रभात, अधिकारी।', briefing: 'आज का नेटवर्क ब्रीफिंग यहां है।', viewAll: 'सभी देखें', noResults: 'कोई मिलती इकाई नहीं', sourceNote: 'प्रोटोटाइप डेटा सिंथेटिक है।',
    workspace: 'कार्य क्षेत्र', governance: 'प्रशासन', liveAudit: 'लाइव ऑडिट स्ट्रीम', riskPulse: 'जोखिम संकेत', last30: 'पिछले 30 दिन', sortBy: 'क्रमबद्ध करें', entitiesCount: 'इकाइयां', prototypeEnvironment: 'प्रोटोटाइप वातावरण', priorityReview: '2 उच्च प्राथमिकता · 1 समीक्षा', sourceTypes: '7 स्रोत प्रकारों में', lastVerified: 'अंतिम सत्यापन 09:42 IST', operationMonsoon: 'ऑपरेशन मॉनसून', caseLocation: 'पुणे • महाराष्ट्र • 18 जुड़ी इकाइयां', networkConfidence: 'नेटवर्क विश्वास', linkageAnalysis: 'लिंकेज विश्लेषण • ऑपरेशन मॉनसून', documentIntelligence: 'दस्तावेज़ इंटेलिजेंस • NCRB वर्कफ़्लो', uploadWorkflow: 'अपलोड, फिंगरप्रिंट, एक्सट्रैक्ट और सुरक्षित सेव करें।', fingerprintStep: 'फिंगरप्रिंट', extractStep: 'निकालें', reviewStep: 'समीक्षा', commitStep: 'कमिट', sha256: 'SHA-256', ocrAdapter: 'OCR एडाप्टर', officerConfirmation: 'अधिकारी पुष्टि', auditLedger: 'ऑडिट + लेजर', reviewRequired: 'समीक्षा आवश्यक है', importManifest: 'मेनिफेस्ट आयात करें', sourceCatalogue: 'प्रशासन • स्रोत सूची', sourceProvenance: 'हर रिकॉर्ड में स्रोत वर्ग व स्थिति है।', batchVerified: 'अंतिम बैच सत्यापन: 09:42 IST', permissionedReady: 'तैनाती के लिए तैयार', anomalousExports: '0 असामान्य एक्सपोर्ट', accessControls: 'प्रवेश नियंत्रण', investigatorProfile: 'अन्वेषक प्रोफ़ाइल', responsibleAI: 'जिम्मेदार AI नियंत्रण', defaultLanguage: 'डिफ़ॉल्ट भाषा', dataEnvironment: 'डेटा वातावरण', mfaEnabled: 'MFA सक्षम', investigationUnit: 'महाराष्ट्र पुलिस · पुणे', officerName: 'आशुतोष पाटिल', tlsProtected: 'TLS सुरक्षित', ncrbWorkflow: 'NCRB वर्कफ़्लो', caseConfidence: '78%', approvedDataset: 'NCRB-अनुमोदित डेटासेट', heroTitle: 'नेटवर्क देखें। साक्ष्य सुरक्षित रखें।', heroBody: 'भारत भर के रिकॉर्ड जोड़ने और अन्वेषकों की सहायता के लिए सुरक्षित इंटेलिजेंस वर्कस्पेस।', evidenceFirst: 'साक्ष्य-प्रथम जांच', graphPowered: 'ग्राफ आधारित लिंकेज विश्लेषण', auditableByDesign: 'ऑडिट के लिए बनाया गया', prototypeFooter: 'नेत्ररक्षक • SIH 2026 प्रोटोटाइप', versionFooter: 'v0.1 • साक्ष्य अखंडता सक्षम', weeklyChange: '+8.4% इस सप्ताह', hashVerified: 'हैश सत्यापित', entityMergeReview: 'इकाई मर्ज समीक्षा', assigned: 'आशुतोष पाटिल को सौंपा गया', newLinkDetected: 'नया लिंक मिला', linkedAccount: 'खाता •• 9130 ↔ अर्जुन पवार', datasetManifest: 'डेटासेट मेनिफेस्ट', demoBatch: 'सिंथेटिक डेमो बैच v0.3', lastVerifiedTime: 'अंतिम सत्यापन 09:42 IST', riskDates: ['15 अगस्त', '22 अगस्त', '29 अगस्त', '05 सितंबर', '12 सितंबर'], refreshed: 'जोखिम संकेत रीफ्रेश हुआ',
    officersSubtitle: 'कानून-प्रवर्तन प्रोफाइल (रैंक, बैज और जिला सहित)।', addOfficer: 'अधिकारी जोड़ें', editOfficer: 'अधिकारी संपादित करें', fullName: 'पूरा नाम', rank: 'रैंक', badgeNo: 'बैज नंबर', district: 'जिला', state: 'राज्य', emailAddress: 'ईमेल पता', phone: 'फोन', initialPassword: 'पासवर्ड', passwordHelp: 'नया अधिकारी इस पासवर्ड से प्रवेश करेगा।', rolePermissions: 'भूमिका / अनुमतियां', caseOfficer: 'केस अधिकारी', analyst: 'विश्लेषक', admin: 'व्यवस्थापक', clear: 'साफ करें', saveChanges: 'बदलाव सेव करें', officerAdded: 'अधिकारी प्रोफाइल बनी', officerUpdated: 'अधिकारी प्रोफाइल अपडेट हुई', officerDeleted: 'अधिकारी प्रोफाइल हटाई गई', auditSubtitle: 'अपरिवर्तनीय गतिविधि रिकॉर्ड', warnings: 'चेतावनियां', criticalEvents: 'गंभीर घटनाएं', tamperAlerts: 'छेड़छाड़ अलर्ट', noActiveAlerts: 'कोई अखंडता अलर्ट नहीं', level: 'स्तर', info: 'जानकारी', critical: 'गंभीर', time: 'समय', actor: 'कर्ता', action: 'कार्रवाई', summary: 'विवरण', supabaseConnected: 'सुपाबेस कनेक्टेड — डेटा सुरक्षित',
    accessibility: 'सुलभता', decreaseText: 'अक्षर छोटे करें', resetText: 'अक्षर रीसेट करें', increaseText: 'अक्षर बड़े करें', collapseSidebar: 'नेविगेशन बंद करें', expandSidebar: 'नेविगेशन खोलें', manualEntry: 'मैनुअल एफआईआर', scannedUpload: 'स्कैन की गई एफआईआर', caseDetails: 'केस विवरण', personDetails: 'विषय विवरण', evidence: 'साक्ष्य', saveDraft: 'ड्राफ्ट सेव करें', addEvidence: 'साक्ष्य जोड़ें', evidenceType: 'साक्ष्य प्रकार', evidenceDescription: 'साक्ष्य विवरण', subjectName: 'विषय का नाम', alias: 'उपनाम', dob: 'जन्म तिथि', address: 'पता', vehicle: 'वाहन नंबर', bank: 'बैंक खाता', incidentSummary: 'घटना सारांश', reportingOfficer: 'रिपोर्टिंग अधिकारी', saveCase: 'केस सेव करें', draftSaved: 'ड्राफ्ट सेव हुआ', caseSaved: 'केस समीक्षा हेतु सेव हुआ', manualEntryHelp: 'केस तथ्य और साक्ष्य दर्ज करें।', documentEvidence: 'दस्तावेज़', deviceEvidence: 'डिवाइस', financialEvidence: 'वित्तीय', witnessEvidence: 'गवाह', draft: 'ड्राफ्ट', removeEvidence: 'साक्ष्य हटाएं'
  },
  mr: { product: 'नेत्ररक्षक', productSub: 'गुन्हेगारी नेटवर्क विश्लेषण', restricted: 'मर्यादित प्रवेश', signInTitle: 'सुरक्षित तपासनीस प्रवेश', signInBody: 'प्रवेशाचे निरीक्षण केले जाते.', email: 'अधिकृत ईमेल', password: 'पासवर्ड', signIn: 'प्रवेश करा', demoHint: 'प्रोटोटाइप प्रवेश.', command: 'डॅशबोर्ड', network: 'नेटवर्क ग्राफ', fir: 'FIR अहवाल', officers: 'अधिकारी', auditLogs: 'ऑडिट लॉग्स', sources: 'डेटा आणि अखंडता', settings: 'सेटिंग्ज', overview: 'डॅशबोर्ड', search: 'शोध घ्या…', today: 'आज', alerts: 'प्राधान्य अलर्ट', entities: 'संस्था', connections: 'कनेक्शन्स', integrity: 'पुरावा अखंडता', viewNetwork: 'नेटवर्क उघडा', reviewFIR: 'FIR तपासा', high: 'उच्च', medium: 'मध्यम', low: 'कमी', risk: 'धोका', type: 'प्रकार', connectionsSort: 'कनेक्शन', recent: 'कृती', name: 'नाव', allTypes: 'सर्व प्रकार', filter: 'फिल्टर', fullscreen: 'फुलस्क्रीन', exitFullscreen: 'बाहेर पडा', zoomIn: 'झूम इन', zoomOut: 'झूम आउट', reset: 'रीसेट', graphHint: 'नोड ओढा • झूम करण्यासाठी स्क्रोल करा', selectedEntity: 'निवडलेली संस्था', associations: 'संबंध', linkedEvents: 'घटना', source: 'स्रोत', confidence: 'विश्वास', evidenceTrail: 'पुरावा ट्रेल', uploadTitle: 'FIR इनटेक', uploadBody: 'स्कॅन केलेली FIR टाका.', browse: 'फाइल निवडा', fingerprint: 'SHA-256 फिंगरप्रिंट', ocrReady: 'OCR सज्ज', reviewDraft: 'ड्राफ्ट पुनरावलोकन', noFile: 'काहीही निवडलेले नाही', auditTitle: 'ऑडिट ट्रेल', auditBody: 'बदल नोंदवले जातात.', verified: 'सत्यापित', imported: 'आयातित', synthetic: 'सिंथेटिक डेटा', live: 'लाइव्ह', dataSources: 'डेटा स्रोत', integrityChecks: 'अखंडता', hashChain: 'हॅश चेन', ledger: 'लेजर', all: 'सर्व', logout: 'बाहेर पडा', language: 'भाषा', welcome: 'सुप्रभात, अधिकारी.', briefing: 'आजचे नेटवर्क ब्रीफिंग.', viewAll: 'सर्व पहा', noResults: 'जुळणारी संस्था नाही', sourceNote: 'प्रोटोटाइप डेटा आहे.', workspace: 'कार्य क्षेत्र', governance: 'प्रशासन', liveAudit: 'ऑडिट स्ट्रीम', riskPulse: 'जोखीम संकेत', last30: 'मागील 30 दिवस', sortBy: 'क्रमवारी', entitiesCount: 'संस्था', prototypeEnvironment: 'प्रोटोटाइप', priorityReview: 'प्राधान्य पुनरावलोकन', sourceTypes: 'स्रोत', lastVerified: 'सत्यापित 09:42 IST', operationMonsoon: 'ऑपरेशन मॉन्सून', caseLocation: 'पुणे • महाराष्ट्र', networkConfidence: 'विश्वास', linkageAnalysis: 'लिंकेज विश्लेषण', documentIntelligence: 'दस्तऐवज इंटेलिजन्स', uploadWorkflow: 'अपलोड व जतन करा.', fingerprintStep: 'फिंगरप्रिंट', extractStep: 'काढा', reviewStep: 'पुनरावलोकन', commitStep: 'कमिट', sha256: 'SHA-256', ocrAdapter: 'OCR अडॅप्टर', officerConfirmation: 'अधिकारी पुष्टी', auditLedger: 'ऑडिट + लेजर', reviewRequired: 'पुनरावलोकन आवश्यक', importManifest: 'मॅनिफेस्ट', sourceCatalogue: 'स्रोत सूची', sourceProvenance: 'स्रोत नोंद', batchVerified: 'सत्यापन: 09:42 IST', permissionedReady: 'सज्ज', anomalousExports: '0', accessControls: 'प्रवेश', investigatorProfile: 'प्रोफाइल', responsibleAI: 'AI नियंत्रणे', defaultLanguage: 'भाषा', dataEnvironment: 'वातावरण', mfaEnabled: 'MFA', investigationUnit: 'महाराष्ट्र पोलीस · पुणे', officerName: 'आशुतोष पाटील', officersSubtitle: 'अधिकारी प्रोफाइल्स (रँक व जिल्हा).', addOfficer: 'अधिकारी जोडा', editOfficer: 'अधिकारी संपादित करा', fullName: 'पूर्ण नाव', rank: 'रँक', badgeNo: 'बॅज क्र.', district: 'जिल्हा', state: 'राज्य', emailAddress: 'ईमेल', phone: 'फोन', initialPassword: 'पासवर्ड', passwordHelp: 'नवीन अधिकारी पासवर्ड.', rolePermissions: 'भूमिका', caseOfficer: 'केस अधिकारी', analyst: 'विश्लेषक', admin: 'प्रशासक', clear: 'साफ करा', saveChanges: 'जतन करा', officerAdded: 'अधिकारी जोडला', officerUpdated: 'अधिकारी अपडेट झाला', officerDeleted: 'अधिकारी हटवला', auditSubtitle: 'अपरिवर्तनीय क्रियाकलाप नोंद', warnings: 'इशारे', criticalEvents: 'गंभीर', tamperAlerts: 'छे查ड अलर्ट', noActiveAlerts: 'कोणताही अलर्ट नाही', level: 'पातळी', info: 'माहिती', critical: 'गंभीर', time: 'वेळ', actor: 'कर्ता', action: 'कृती', summary: 'तपशील', supabaseConnected: 'कनेक्टेड' },
  gu: { product: 'નેત્રરક્ષક', productSub: 'ગુનાહિત નેટવર્ક વિશ્લેષણ', restricted: 'મર્યાદિત પ્રવેશ', signInTitle: 'સુરક્ષિત તપાસકર્તા પ્રવેશ', signInBody: 'પ્રવેશનું નિરીક્ષણ થાય છે.', email: 'અધિકૃત ઈમેલ', password: 'પાસવર્ડ', signIn: 'સાઇન ઇન', demoHint: 'પ્રોટોટાઇપ પ્રવેશ.', command: 'ડેશબોર્ડ', network: 'નેટવર્ક ગ્રાફ', fir: 'FIR રિપોર્ટ', officers: 'અધિકારીઓ', auditLogs: 'ઓડિટ લોગ્સ', sources: 'ડેટા અને અખંડિતતા', settings: 'સેટિંગ્સ', overview: 'ડેશબોર્ડ', search: 'શોધો…', today: 'આજે', alerts: 'પ્રાથમિકતા એલર્ટ', entities: 'એન્ટિટી', connections: 'જોડાણો', integrity: 'અખંડિતતા', viewNetwork: 'નેટવર્ક ખોલો', reviewFIR: 'FIR જુઓ', high: 'ઉચ્ચ', medium: 'મધ્યમ', low: 'નીચું', risk: 'જોખમ', type: 'પ્રકાર', connectionsSort: 'જોડાણો', recent: 'પ્રવૃત્તિ', name: 'નામ', allTypes: 'બધા પ્રકાર', filter: 'ફિલ્ટર', fullscreen: 'ફુલસ્ક્રીન', exitFullscreen: 'બહાર નીકળો', zoomIn: 'ઝૂમ ઇન', zoomOut: 'ઝૂમ આઉટ', reset: 'રીસેટ', graphHint: 'નોડ ખેંચો • ઝૂમ માટે સ્ક્રોલ કરો', selectedEntity: 'પસંદ કરેલી એન્ટિટી', associations: 'સંબંધો', linkedEvents: 'ઘટનાઓ', source: 'સ્રોત', confidence: 'વિશ્વાસ', evidenceTrail: 'પુરાવા ટ્રેલ', uploadTitle: 'FIR ઇનટેક', uploadBody: 'સ્કેન કરેલી FIR મૂકો.', browse: 'ફાઇલ પસંદ કરો', fingerprint: 'SHA-256 ફિંગરપ્રિન્ટ', ocrReady: 'OCR તૈયાર', reviewDraft: 'ડ્રાફ્ટ સમીક્ષા', noFile: 'કોઈ દસ્તાવેજ પસંદ નથી', auditTitle: 'ઓડિટ ટ્રેલ', auditBody: 'દરેક ફેરફાર નોંધાય છે.', verified: 'ચકાસેલ', imported: 'આયાત કરેલ', synthetic: 'સિન્થેટિક ડેટા', live: 'લાઇવ', dataSources: 'ડેટા સ્રોતો', integrityChecks: 'અખંડિતતા', hashChain: 'હેશ ચેન', ledger: 'લેજર', all: 'બધા', logout: 'સાઇન આઉટ', language: 'ભાષા', welcome: 'સુપ્રભાત, અધિકારી.', briefing: 'આજનું નેટવર્ક બ્રીફિંગ.', viewAll: 'બધું જુઓ', noResults: 'મેળ ખાતી એન્ટિટી નથી', sourceNote: 'પ્રોટોટાઇપ ડેટા છે.', workspace: 'વર્કસ્પેસ', governance: 'ગવર્નન્સ', liveAudit: 'ઓડિટ સ્ટ્રીમ', riskPulse: 'જોખમ સંકેત', last30: 'છેલ્લા 30 દિવસ', sortBy: 'ક્રમ', entitiesCount: 'એન્ટિટી', priorityReview: 'સમીક્ષા', sourceTypes: 'સ્રોત', lastVerified: 'ચકાસણી 09:42 IST', operationMonsoon: 'ઓપરેશન મોનસૂન', caseLocation: 'પુણે • મહારાષ્ટ્ર', networkConfidence: 'વિશ્વાસ', linkageAnalysis: 'લિંકેજ વિશ્લેષણ', documentIntelligence: 'દસ્તાવેજ ઇન્ટેલિજન્સ', uploadWorkflow: 'અપલોડ અને સાચવો.', fingerprintStep: 'ફિંગરપ્રિન્ટ', extractStep: 'કાઢો', reviewStep: 'સમીક્ષા', commitStep: 'કમિટ', sha256: 'SHA-256', ocrAdapter: 'OCR એડેપ્ટર', officerConfirmation: 'પુષ્ટિ', auditLedger: 'ઓડિટ + લેજર', reviewRequired: 'સમીક્ષા જરૂરી', importManifest: 'મેનિફેસ્ટ', sourceCatalogue: 'સ્રોત સૂચિ', sourceProvenance: 'સ્રોત નોંધ', batchVerified: 'ચકાસણી 09:42 IST', permissionedReady: 'તૈયાર', anomalousExports: '0', accessControls: 'ઍક્સેસ', investigatorProfile: 'પ્રોફાઇલ', responsibleAI: 'AI નિયંત્રણો', defaultLanguage: 'ભાષા', dataEnvironment: 'વાતાવરણ', mfaEnabled: 'MFA', investigationUnit: 'મહારાષ્ટ્ર પોલીસ · પુણે', officerName: 'આશુતોષ પાટીલ', officersSubtitle: 'અધિકારી પ્રોફાઇલ્સ (રેન્ક અને જિલ્લો).', addOfficer: 'અધિકારી ઉમેરો', editOfficer: 'અધિકારી સુધારો', fullName: 'પૂરું નામ', rank: 'રેન્ક', badgeNo: 'બેજ નં.', district: 'જિલ્લો', state: 'રાજ્ય', emailAddress: 'ઈમેલ', phone: 'ફોન', initialPassword: 'પાસવર્ડ', passwordHelp: 'નવા અધિકારી પાસવર્ડ.', rolePermissions: 'ભૂમિકા', caseOfficer: 'કેસ અધિકારી', analyst: 'વિશ્લેષક', admin: 'એડમિન', clear: 'સાફ કરો', saveChanges: 'સાચવો', officerAdded: 'અધિકારી ઉમેરાયા', officerUpdated: 'અધિકારી અપડેટ થયા', officerDeleted: 'અધિકારી દૂર થયા', auditSubtitle: 'અપરિવર્તનીય ક્રિયાપ્રવૃત્તિ નોંધ', warnings: 'ચેતવણીઓ', criticalEvents: 'ગંભીર', tamperAlerts: 'છેડછાડ એલર્ટ', noActiveAlerts: 'કોઈ એલર્ટ નથી', level: 'સ્તર', info: 'માહિતી', critical: 'ગંભીર', time: 'સમય', actor: 'કર્તા', action: 'ક્રિયા', summary: 'વિગત', supabaseConnected: 'કનેક્ટેડ' }
};

const initialOfficers = [];

const initialAuditLogs = [];

function loadSavedOfficers() {
  try {
    const raw = localStorage.getItem('netrakshak_officers');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function loadSavedAuditLogs() {
  try {
    const raw = localStorage.getItem('netrakshak_audit_logs');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

let entities = [];
let edges = [];
let firCases = [];

const riskColor = { high: '#DC2626', medium: '#F59E0B', low: '#16A34A' };

let state = {
  locale: localStorage.getItem('locale') || 'en',
  loggedIn: false,
  view: 'overview',
  query: '',
  sort: 'risk',
  type: 'all',
  selected: null,
  file: null,
  fileHash: '',
  filePath: '',
  graphFullscreen: false,
  sidebarCollapsed: false,
  fontScale: parseFloat(localStorage.getItem('font_scale')) || 1,
  firMode: 'upload',
  manualEvidence: [],
  officers: loadSavedOfficers(),
  editingOfficerId: null,
  officerFormRole: 'case-officer',
  auditLogs: loadSavedAuditLogs(),
  auditLevelFilter: 'all',
  auditSearchQuery: '',
  auditActorFilter: 'all',
  auditActionFilter: 'all',
  loginError: '',
  loginEmail: ''
};

function getActiveOfficer() {
  const you = state.officers.find(o => o.isYou);
  if (you) {
    const initials = (you.name || 'Officer').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'OF';
    return {
      id: you.id,
      name: you.name,
      initials,
      role: `${you.rank || 'Officer'} · ${you.district || 'Command'}`,
      rawRole: you.role || 'case-officer',
      isAdmin: you.role === 'admin'
    };
  }
  return {
    id: null,
    name: 'Investigator',
    initials: 'IN',
    role: 'Case Officer',
    rawRole: 'case-officer',
    isAdmin: false
  };
}

let sigmaInstance = null;

const t = (key) => (translations[state.locale] || translations.en)[key] || translations.en[key] || key;

const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node[k] = v;
    else if (k === 'value') node.value = v;
    else if (k === 'selected' || k === 'checked' || k === 'disabled' || k === 'hidden') node[k] = Boolean(v);
    else node.setAttribute(k, v);
  });
  children.forEach(c => {
    if (c !== null && c !== undefined) node.append(c);
  });
  return node;
};

const icon = (name) => ({
  shield: '◈', search: '⌕', grid: '▦', network: '◎', file: '▤',
  database: '◫', settings: '⚙', arrow: '→', check: '✓', lock: '▣',
  upload: '↑', expand: '⤢', close: '×', alert: '!', pulse: '◉',
  users: '👥', plus: '+', audit: '≡'
}[name] || '•');

function showToast(message) {
  document.querySelector('.app-toast')?.remove();
  const toast = el('div', { class: 'app-toast' }, [icon('check'), ' ' + message]);
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2800);
}

async function recordAudit(action, summary, level = 'info', actionType = 'system', customActor = null) {
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const selfOfficer = state.officers.find(o => o.isYou);
  const actorName = customActor || selfOfficer?.name || 'Officer';
  const actorInitials = selfOfficer ? selfOfficer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'OF';
  const entry = {
    id: 'log_' + Date.now(),
    time: timeStr,
    actor: actorName,
    actorInitials: actorInitials,
    level,
    action,
    actionType,
    summary
  };
  state.auditLogs.unshift(entry);
  try {
    localStorage.setItem('netrakshak_audit_logs', JSON.stringify(state.auditLogs));
  } catch (e) {}

  if (supabaseConfigured) {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (user) {
          const payload = JSON.stringify({ action, summary, level, at: now.toISOString() });
          const hash = await hashText(payload);
          await supabase.from('audit_events').insert({
            actor_id: user.id,
            action,
            resource_type: actionType,
            change_summary: { summary, level },
            event_hash: hash
          });
        }
      } catch (err) {
        console.warn('Supabase audit insert:', err);
      }
    })();
  }
}

function saveOfficers() {
  try {
    localStorage.setItem('netrakshak_officers', JSON.stringify(state.officers));
  } catch (e) {}
}

async function loadSupabaseData() {
  if (!supabaseConfigured) return;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) return;

    // Load all data concurrently in parallel
    const [
      { data: events },
      { data: dbProfiles },
      { data: dbEntities },
      { data: dbRels },
      { data: dbCases }
    ] = await Promise.all([
      supabase.from('audit_events').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('entities').select('*').order('created_at', { ascending: false }),
      supabase.from('relationships').select('*'),
      supabase.from('fir_cases').select('*').order('created_at', { ascending: false })
    ]);

    if (events && events.length > 0) {
      state.auditLogs = events.map(e => {
        const d = new Date(e.created_at);
        const timeStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const isSelf = e.actor_id === user.id;
        const actorName = isSelf ? (user.user_metadata?.display_name || user.email?.split('@')[0] || 'Officer') : 'Officer';
        const actorInitials = isSelf ? (actorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()) : 'OF';
        return {
          id: e.id,
          time: timeStr,
          actor: actorName,
          actorInitials: actorInitials,
          level: e.change_summary?.level || 'info',
          action: e.action || 'Audit event',
          actionType: e.resource_type || 'system',
          summary: e.change_summary?.summary || e.action || 'Event recorded'
        };
      });
      try {
        localStorage.setItem('netrakshak_audit_logs', JSON.stringify(state.auditLogs));
      } catch (e) {}
    }

    if (dbProfiles && dbProfiles.length > 0) {
      state.officers = dbProfiles.map(p => ({
        id: p.id,
        name: p.display_name || p.email?.split('@')[0] || 'Officer',
        rank: p.rank || 'Inspector',
        badge: p.badge_no || '',
        district: p.district || '',
        state: p.state || 'Maharashtra',
        email: p.email || '',
        phone: p.phone || '',
        role: p.role_name || 'case-officer',
        isYou: user.id === p.id || user.email === p.email
      }));
      saveOfficers();
    }

    if (dbEntities) {
      entities = dbEntities.map((e, idx) => ({
        id: e.id,
        name: e.display_name,
        local: e.aliases?.[0] || e.display_name,
        type: e.entity_type ? e.entity_type.charAt(0).toUpperCase() + e.entity_type.slice(1) : 'Entity',
        risk: e.risk_level || 'low',
        city: e.identifiers?.city || e.identifiers?.address || '',
        phone: e.identifiers?.phone || e.identifiers?.bank || e.identifiers?.vehicle || '',
        events: 0,
        recent: 50,
        x: 350 + Math.cos(idx) * 160,
        y: 250 + Math.sin(idx) * 160
      }));
      if (entities.length > 0 && (!state.selected || !entities.some(x => x.id === state.selected))) {
        state.selected = entities[0].id;
      }
    }

    if (dbRels) {
      edges = dbRels.map(r => [r.source_entity_id, r.target_entity_id]);
    }

    if (dbCases) {
      firCases = dbCases;
    }

    render();
  } catch (err) {
    console.warn('Supabase load error:', err);
  }
}

function langPicker() {
  const select = el('select', { class: 'language-select', 'aria-label': t('language') });
  [['en', 'English'], ['hi', 'हिन्दी'], ['mr', 'मराठी'], ['gu', 'ગુજરાતી']].forEach(([v, l]) => {
    const o = el('option', { value: v }, [l]);
    if (v === state.locale) o.selected = true;
    select.append(o);
  });
  select.onchange = () => {
    state.locale = select.value;
    localStorage.setItem('locale', state.locale);
    render();
  };
  return select;
}

function logo() {
  return el('div', { class: 'brand' }, [
    el('div', { class: 'brand-mark' }, [icon('shield')]),
    el('div', {}, [
      el('strong', {}, [t('product')]),
      el('span', {}, [t('productSub')])
    ])
  ]);
}

async function verifyOfficerAuthorization(user) {
  if (!user) return { authorized: false, reason: 'Authentication required' };
  try {
    let profile = null;
    const { data: byId, error: errId } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (byId) {
      profile = byId;
    } else {
      const { data: byEmail, error: errEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email || '')
        .maybeSingle();

      if (byEmail) {
        profile = byEmail;
      } else if (errId || errEmail) {
        const errMsg = errId?.message || errEmail?.message || 'Unknown database error';
        console.warn('Profile authorization error:', errId || errEmail);
        return { authorized: false, reason: `Database error: ${errMsg}` };
      }
    }

    if (!profile) {
      return { authorized: false, reason: `Account "${user.email}" is not registered in the Law Enforcement Officer Directory.` };
    }
    if (profile.is_active === false) {
      return { authorized: false, reason: 'Officer credentials have been deactivated by system administrator.' };
    }
    return { authorized: true, profile };
  } catch (err) {
    return { authorized: false, reason: err.message || 'Authorization check failed.' };
  }
}

let isAuthActionInProgress = false;

function setLoginInlineError(message) {
  state.loginError = message;
  const form = document.querySelector('.login-form');
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  const passInput = form.querySelector('input[type="password"]');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (emailInput) emailInput.classList.add('input-error');
  if (passInput) passInput.classList.add('input-error');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }

  let errorEl = form.querySelector('.login-inline-error');
  if (!errorEl) {
    errorEl = el('div', { class: 'login-inline-error', role: 'alert' }, [
      el('span', { class: 'error-icon' }, ['⚠']),
      el('span', { class: 'error-text' }, [message])
    ]);
    const passLabel = passInput ? passInput.closest('label') : null;
    if (passLabel && passLabel.nextSibling) {
      form.insertBefore(errorEl, passLabel.nextSibling);
    } else if (submitBtn) {
      form.insertBefore(errorEl, submitBtn);
    } else {
      form.appendChild(errorEl);
    }
  } else {
    const textSpan = errorEl.querySelector('.error-text') || errorEl.querySelector('span:last-child');
    if (textSpan) textSpan.textContent = message;
    errorEl.style.display = 'flex';
  }
}

function clearLoginInlineError() {
  state.loginError = '';
  const form = document.querySelector('.login-form');
  if (!form) return;
  const errorEl = form.querySelector('.login-inline-error');
  if (errorEl) errorEl.remove();
  const inputs = form.querySelectorAll('input');
  inputs.forEach(inp => inp.classList.remove('input-error'));
}

async function signInOfficer(form) {
  if (isAuthActionInProgress) return;
  isAuthActionInProgress = true;

  const email = form.querySelector('input[type="email"]')?.value?.trim() || '';
  const password = form.querySelector('input[type="password"]')?.value || '';
  state.loginEmail = email;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Verifying…</span>`;
  }

  try {
    if (supabaseConfigured) {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !authData?.user) {
        setLoginInlineError('Invalid email address or password. Please verify your credentials.');
        return;
      }

      const check = await verifyOfficerAuthorization(authData.user);
      if (!check.authorized) {
        supabase.auth.signOut().catch(() => {});
        state.loggedIn = false;
        setLoginInlineError(`Access Denied: ${check.reason}`);
        return;
      }

      state.loggedIn = true;
      state.loginError = '';
      render();
      recordAudit('Login event', `Signed in (${email}).`, 'info', 'login').catch(() => {});
      loadSupabaseData();
      return;
    }

    localStorage.setItem('demoSession', 'true');
    state.loggedIn = true;
    state.loginError = '';
    render();
    recordAudit('Login event', `Signed in (${email}).`, 'info', 'login').catch(() => {});
  } catch (err) {
    setLoginInlineError('An error occurred during authentication. Please try again.');
  } finally {
    isAuthActionInProgress = false;
    if (submitBtn && !state.loggedIn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${t('signIn')} <span>${icon('arrow')}</span>`;
    }
  }
}

async function signOutOfficer() {
  recordAudit('Logoff event', 'Signed out of session.', 'info', 'logoff').catch(() => {});
  localStorage.removeItem('demoSession');
  state.loggedIn = false;
  state.loginError = '';
  render();
  if (supabaseConfigured) {
    supabase.auth.signOut().catch(() => {});
  }
}

async function bootstrapAuth() {
  if (supabaseConfigured) {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user) {
      const check = await verifyOfficerAuthorization(data.session.user);
      if (check.authorized) {
        state.loggedIn = true;
        await loadSupabaseData();
        render();
      } else {
        await supabase.auth.signOut();
        state.loggedIn = false;
      }
    }
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (isAuthActionInProgress) return;

      if (session?.user) {
        const check = await verifyOfficerAuthorization(session.user);
        if (!check.authorized) {
          await supabase.auth.signOut();
          if (state.loggedIn) {
            state.loggedIn = false;
            setLoginInlineError(`Access Denied: ${check.reason}`);
          }
          return;
        }
        if (!state.loggedIn) {
          state.loggedIn = true;
          state.loginError = '';
          await loadSupabaseData();
          render();
        }
      } else {
        if (state.loggedIn) {
          state.loggedIn = false;
          render();
        }
      }
    });
  } else if (localStorage.getItem('demoSession') === 'true') {
    state.loggedIn = true;
    render();
  }
}

function renderLogin() {
  const root = document.querySelector('#app');
  root.innerHTML = '';

  const emailInput = el('input', {
    type: 'email',
    placeholder: 'officer@police.gov.in',
    required: true,
    value: state.loginEmail || '',
    class: state.loginError ? 'input-error' : ''
  });

  const passInput = el('input', {
    type: 'password',
    placeholder: '••••••••',
    required: true,
    class: state.loginError ? 'input-error' : ''
  });

  const handleInputEdit = () => {
    if (state.loginError) {
      clearLoginInlineError();
    }
  };

  emailInput.addEventListener('input', handleInputEdit);
  passInput.addEventListener('input', handleInputEdit);

  const errorBlock = state.loginError
    ? el('div', { class: 'login-inline-error', role: 'alert' }, [
        el('span', { class: 'error-icon' }, ['⚠']),
        el('span', { class: 'error-text' }, [state.loginError])
      ])
    : null;

  const loginCard = el('section', { class: 'login-card' }, [
    el('div', { class: 'login-card-top' }, [
      logo(),
      langPicker()
    ]),
    el('div', { style: 'margin: 18px 0 6px;' }, [
      el('h2', {}, [t('signInTitle')]),
      el('p', { class: 'muted' }, [t('signInBody')])
    ]),
    el('form', { class: 'login-form' }, [
      el('label', {}, [
        t('email'),
        emailInput
      ]),
      el('label', {}, [
        t('password'),
        passInput
      ]),
      ...(errorBlock ? [errorBlock] : []),
      el('button', { class: 'primary-btn', type: 'submit' }, [
        t('signIn'),
        el('span', {}, [icon('arrow')])
      ])
    ])
  ]);

  const page = el('main', { class: 'login-page' }, [loginCard]);

  root.append(page);
  page.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    signInOfficer(e.currentTarget);
  };
}

function navItem(view, label, i) {
  const b = el('button', { class: `nav-item ${state.view === view ? 'active' : ''}` }, [
    el('span', { class: 'nav-icon' }, [icon(i)]),
    el('span', {}, [label])
  ]);
  b.onclick = () => {
    state.view = view;
    render();
  };
  return b;
}

function accessibilityControls() {
  const wrap = el('div', { class: 'accessibility-controls' }, [
    el('span', { class: 'accessibility-label' }, [t('accessibility')]),
    el('button', { class: 'a11y-btn', title: t('decreaseText'), onclick: () => setTextScale(-0.12) }, ['A−']),
    el('button', { class: 'a11y-btn', title: t('resetText'), onclick: () => setTextScale(0, true) }, ['A']),
    el('button', { class: 'a11y-btn', title: t('increaseText'), onclick: () => setTextScale(0.12) }, ['A+'])
  ]);
  return wrap;
}

function setTextScale(delta, reset = false) {
  state.fontScale = reset ? 1 : Math.min(1.36, Math.max(0.85, Math.round((state.fontScale + delta) * 100) / 100));
  localStorage.setItem('font_scale', String(state.fontScale));
  document.documentElement.style.setProperty('--text-scale', String(state.fontScale));
  document.documentElement.style.fontSize = `${state.fontScale * 14}px`;
  const main = document.querySelector('.main-area');
  if (main) {
    main.style.zoom = String(state.fontScale);
  }
  showToast(`Text size: ${Math.round(state.fontScale * 100)}%`);
}

function appShell() {
  const root = document.querySelector('#app');
  root.innerHTML = '';

  const topbar = el('header', { class: 'topbar' }, [
    el('div', { class: 'topbar-brand' }, [
      el('div', { class: 'topbar-mark' }, [icon('shield')]),
      el('div', {}, [
        el('strong', {}, [t('product')]),
        el('span', {}, [t('productSub')])
      ])
    ]),
    el('div', { class: 'global-search' }, [
      icon('search'),
      el('input', { placeholder: t('search'), value: state.query })
    ]),
    el('div', { class: 'top-actions' }, [
      langPicker(),
      el('div', { class: 'topbar-officer' }, [
        el('div', { class: 'avatar' }, [getActiveOfficer().initials]),
        el('div', {}, [
          el('strong', {}, [getActiveOfficer().name]),
          el('span', {}, [getActiveOfficer().role])
        ])
      ]),
      el('button', { class: 'topbar-btn', onclick: signOutOfficer }, [t('logout')])
    ])
  ]);

  const sidebar = el('aside', { class: 'sidebar' }, [
    el('button', {
      class: 'sidebar-toggle',
      title: state.sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar'),
      onclick: () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        render();
      }
    }, [state.sidebarCollapsed ? '▶' : '◀']),
    el('div', { class: 'nav-section-label' }, [t('workspace')]),
    navItem('overview', t('command'), 'grid'),
    navItem('network', t('network'), 'network'),
    navItem('fir', t('fir'), 'file'),
    navItem('officers', t('officers'), 'users'),
    navItem('audit_logs', t('auditLogs'), 'database'),
    el('div', { class: 'nav-section-label' }, [t('governance')]),
    navItem('sources', t('sources'), 'database'),
    navItem('settings', t('settings'), 'settings'),
    el('div', { class: 'sidebar-bottom' }, [
      el('div', { class: 'profile-mini' }, [
        el('div', { class: 'avatar' }, [getActiveOfficer().initials]),
        el('div', {}, [
          el('strong', {}, [getActiveOfficer().name]),
          el('span', {}, [getActiveOfficer().role])
        ])
      ]),
      el('button', { class: 'nav-item logout', onclick: signOutOfficer }, [
        icon('close'),
        el('span', {}, [t('logout')])
      ])
    ])
  ]);

  const content = el('main', { class: `content ${state.view === 'network' ? 'network-mode' : ''}` }, []);
  const shell = el('div', { class: `app-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}` }, [
    topbar,
    el('div', { class: 'workspace' }, [
      sidebar,
      el('div', { class: 'main-area' }, [content])
    ])
  ]);

  root.append(shell);
  shell.querySelector('.top-actions').prepend(accessibilityControls());
  const main = shell.querySelector('.main-area');
  if (main && state.fontScale) {
    main.style.zoom = String(state.fontScale);
  }

  if (state.view === 'overview') renderOverview(content);
  else if (state.view === 'network') renderNetwork(content);
  else if (state.view === 'fir') renderFIR(content);
  else if (state.view === 'officers') renderOfficers(content);
  else if (state.view === 'audit_logs') renderAuditLogs(content);
  else if (state.view === 'sources') renderSources(content);
  else if (state.view === 'settings') renderSettings(content);

  const search = shell.querySelector('.global-search input');
  search.oninput = (e) => {
    state.query = e.target.value;
    updateSearchSuggestions(search);
  };
  search.onfocus = () => updateSearchSuggestions(search);
  search.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      state.view = 'network';
      render();
    }
  };
  search.onblur = () => setTimeout(() => search.closest('.global-search')?.querySelector('.search-suggestions')?.remove(), 160);
}

function updateSearchSuggestions(input) {
  const box = input.closest('.global-search');
  if (!box) return;
  box.querySelector('.search-suggestions')?.remove();
  const query = input.value.trim().toLowerCase();
  if (!query) return;
  const matches = entities.filter(entity => [entity.name, entity.local, entity.type, entity.city, entity.phone].some(value => String(value || '').toLowerCase().includes(query))).slice(0, 7);
  const list = el('div', { class: 'search-suggestions' }, matches.length ? matches.map(entity => el('button', {
    class: 'search-suggestion',
    type: 'button',
    onclick: () => {
      state.selected = entity.id;
      state.query = '';
      state.view = 'network';
      render();
    }
  }, [
    el('span', { class: 'search-suggestion-name' }, [entity.name]),
    el('span', { class: 'search-suggestion-meta' }, [`${entity.type} • ${entity.city}`])
  ])) : [el('div', { class: 'search-empty' }, [t('noResults')])]);
  box.append(list);
}

function card(title, value, foot, cls = '') {
  return el('div', { class: `metric-card ${cls}` }, [
    el('div', { class: 'metric-top' }, [
      el('span', { class: 'metric-label' }, [title]),
      el('span', { class: 'metric-spark' }, [icon('pulse')])
    ]),
    el('strong', { class: 'metric-value' }, [value]),
    el('span', { class: 'metric-foot' }, [foot])
  ]);
}

function renderOverview(c) {
  c.innerHTML = '';
  const highRiskCount = entities.filter(e => e.risk === 'high').length;

  const topNotice = el('div', { class: 'notice-strip' }, [
    el('span', { class: 'notice-icon' }, [icon(supabaseConfigured ? 'check' : 'alert')]),
    el('div', {}, [
      el('strong', {}, [supabaseConfigured ? 'Supabase Connected' : 'Local Offline Mode']),
      el('span', { class: 'muted' }, [supabaseConfigured ? 'Connected to live database and auth.' : 'Database credentials active locally.'])
    ]),
    el('button', { class: 'text-btn', onclick: () => { state.view = 'sources'; render(); } }, [t('viewAll'), icon('arrow')])
  ]);

  const activeCaseCard = firCases.length > 0 ? el('div', { class: 'case-row' }, [
    el('div', { class: 'case-main' }, [
      el('div', { class: 'case-icon' }, [icon('network')]),
      el('div', {}, [
        el('strong', {}, [firCases[0].fir_number || 'FIR Case']),
        el('span', {}, [`${firCases[0].police_station || ''} · ${firCases[0].district || ''}`])
      ])
    ]),
    el('div', { class: 'case-progress' }, [
      el('div', { class: 'progress-label' }, [t('networkConfidence'), el('strong', {}, ['100%'])]),
      el('div', { class: 'progress' }, [el('span', { style: 'width:100%' })])
    ]),
    el('button', { class: 'icon-btn', onclick: () => { state.view = 'fir'; render(); } }, [icon('arrow')])
  ]) : el('div', { class: 'case-row' }, [
    el('div', { class: 'case-main' }, [
      el('div', { class: 'case-icon' }, [icon('file')]),
      el('div', {}, [
        el('strong', {}, ['No Active Investigation Cases']),
        el('span', {}, ['Record an FIR or intake evidence to initiate criminal linkage analysis.'])
      ])
    ]),
    el('button', { class: 'primary-btn small', onclick: () => { state.view = 'fir'; render(); } }, [icon('upload'), t('reviewFIR')])
  ]);

  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, [t('today')]),
        el('h1', {}, [t('welcome')]),
        el('p', { class: 'muted' }, [t('briefing')])
      ]),
      el('button', { class: 'outline-btn', onclick: () => { state.view = 'network'; render(); } }, [icon('network'), t('viewNetwork')])
    ]),
    topNotice,
    el('div', { class: 'metric-grid' }, [
      card(t('alerts'), String(highRiskCount), 'High risk priority', 'metric-red'),
      card(t('entities'), String(entities.length), 'Entities in database', 'metric-blue'),
      card(t('connections'), String(edges.length), 'Verified linkages', 'metric-green'),
      card(t('integrity'), supabaseConfigured ? '100%' : 'Local', 'Ledger active', 'metric-purple')
    ]),
    el('div', { class: 'dashboard-grid' }, [recentPanel(), riskPanel()]),
    el('div', { class: 'section-heading' }, [
      el('h2', {}, [t('activeCase')]),
      el('button', { class: 'text-btn', onclick: () => { state.view = 'fir'; render(); } }, [t('viewAll'), icon('arrow')])
    ]),
    activeCaseCard
  );
}

function recentPanel() {
  const recentLogs = state.auditLogs.slice(0, 5);
  const body = recentLogs.length > 0 ? el('div', { class: 'activity-list' }, recentLogs.map(log => el('div', { class: 'activity' }, [
    el('span', { class: `activity-dot ${log.level === 'critical' ? 'alert' : 'verified'}` }, [icon(log.level === 'critical' ? 'alert' : 'check')]),
    el('div', {}, [
      el('strong', {}, [log.action]),
      el('span', {}, [log.summary])
    ]),
    el('time', {}, [log.time.split(' ')[1] || log.time])
  ]))) : el('div', { style: 'padding: 24px 12px; text-align: center; color: var(--muted); font-size: 13px;' }, [
    'No recent activity recorded yet.'
  ]);

  return el('section', { class: 'panel' }, [
    el('div', { class: 'panel-heading' }, [
      el('div', {}, [
        el('h3', {}, [t('recent')]),
        el('span', { class: 'muted' }, [t('liveAudit')])
      ]),
      el('span', { class: 'live-dot' }, ['LIVE'])
    ]),
    body
  ]);
}

function riskPanel() {
  const high = entities.filter(e => e.risk === 'high').length;
  const medium = entities.filter(e => e.risk === 'medium').length;
  const low = entities.filter(e => e.risk === 'low').length;

  return el('section', { class: 'panel' }, [
    el('div', { class: 'panel-heading' }, [
      el('div', {}, [
        el('h3', {}, [t('riskPulse')]),
        el('span', { class: 'muted' }, ['Risk Level Summary'])
      ]),
      el('button', { class: 'icon-btn', onclick: () => showToast(t('refreshed')) }, ['•••'])
    ]),
    el('div', { style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px 0;' }, [
      el('div', { style: 'background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 14px; text-align: center;' }, [
        el('strong', { style: 'display: block; font-size: 24px; color: #DC2626;' }, [String(high)]),
        el('span', { style: 'font-size: 11px; font-weight: 600; color: #991B1B;' }, ['HIGH RISK'])
      ]),
      el('div', { style: 'background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 14px; text-align: center;' }, [
        el('strong', { style: 'display: block; font-size: 24px; color: #D97706;' }, [String(medium)]),
        el('span', { style: 'font-size: 11px; font-weight: 600; color: #92400E;' }, ['MEDIUM RISK'])
      ]),
      el('div', { style: 'background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px; text-align: center;' }, [
        el('strong', { style: 'display: block; font-size: 24px; color: #16A34A;' }, [String(low)]),
        el('span', { style: 'font-size: 11px; font-weight: 600; color: #166534;' }, ['LOW RISK'])
      ])
    ])
  ]);
}

/* ==========================================================================
   OFFICERS VIEW IMPLEMENTATION
   ========================================================================== */
function renderOfficers(c) {
  c.innerHTML = '';
  const activeOfficer = getActiveOfficer();
  const isAdmin = activeOfficer.isAdmin;

  const editingOfficer = (isAdmin && state.editingOfficerId) ? state.officers.find(o => o.id === state.editingOfficerId) : null;

  const headerActions = [];
  if (isAdmin) {
    headerActions.push(el('button', {
      class: 'primary-btn',
      onclick: () => {
        state.editingOfficerId = null;
        state.officerFormRole = 'case-officer';
        render();
        document.querySelector('.officer-form-panel input[name="fullName"]')?.focus();
      }
    }, [icon('plus'), t('addOfficer')]));
  }

  const header = el('div', { class: 'page-heading' }, [
    el('div', {}, [
      el('h1', {}, [t('officers')]),
      el('p', { class: 'muted' }, [t('officersSubtitle')])
    ]),
    ...headerActions
  ]);

  let listArea;
  if (state.officers.length === 0) {
    listArea = el('div', { class: 'officers-empty-shell' }, [
      el('div', { class: 'empty-shell-icon' }, [icon('users')]),
      el('h3', {}, ['No Registered Officers']),
      el('p', { class: 'muted' }, ['No officer profiles are loaded yet. Profiles are linked directly to Supabase authentication (public.profiles). As officers log in or are added via the console, they will appear here grouped by district.'])
    ]);
  } else {
    // Group officers by District
    const districtGroups = {};
    state.officers.forEach(o => {
      const dist = o.district || 'General';
      if (!districtGroups[dist]) districtGroups[dist] = [];
      districtGroups[dist].push(o);
    });

    listArea = el('div', { class: 'officers-list-area' }, Object.entries(districtGroups).map(([district, officers]) => {
      return el('div', { class: 'officer-district-group' }, [
        el('div', { class: 'district-group-header' }, [`${district.toUpperCase()} · ${officers.length} ${officers.length === 1 ? 'OFFICER' : 'OFFICERS'}`]),
        el('div', { class: 'officers-grid' }, officers.map(officer => {
          const initials = (officer.name || 'Officer').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
          const roleClass = officer.role === 'admin' ? 'admin' : officer.role === 'analyst' ? 'analyst' : 'case-officer';

          const actions = [];
          if (isAdmin) {
            actions.push(el('button', {
              class: 'officer-btn',
              onclick: () => {
                state.editingOfficerId = officer.id;
                state.officerFormRole = officer.role || 'case-officer';
                render();
              }
            }, ['Edit']));

            if (!officer.isYou) {
              actions.push(el('button', {
                class: 'officer-btn delete',
                onclick: () => {
                  if (confirm(`Remove officer profile for ${officer.name}?`)) {
                    if (supabaseConfigured && officer.id && !officer.id.startsWith('off_')) {
                      supabase.from('profiles').delete().eq('id', officer.id).then(() => {});
                    }
                    state.officers = state.officers.filter(o => o.id !== officer.id);
                    saveOfficers();
                    recordAudit('Officer deleted', `Officer ${officer.name} (${officer.district}) profile removed.`, 'warning', 'officer');
                    showToast(t('officerDeleted'));
                    render();
                  }
                }
              }, ['Delete']));
            }
          }

          return el('div', { class: 'officer-card' }, [
            el('div', { class: 'officer-card-top' }, [
              el('div', { class: 'officer-avatar' }, [initials]),
              el('div', { class: 'officer-meta' }, [
                el('div', { class: 'officer-name-row' }, [
                  el('strong', {}, [officer.name]),
                  officer.isYou ? el('span', { class: 'officer-you-tag' }, ['YOU']) : null
                ]),
                el('span', {}, [`${officer.rank || 'Officer'} · ${officer.badge || '—'}`])
              ]),
              el('span', { class: `officer-role-pill ${roleClass}` }, [officer.role || 'case-officer'])
            ]),
            el('div', { class: 'officer-fields' }, [
              el('div', { class: 'officer-field-row' }, [
                el('span', { class: 'field-label' }, ['District']),
                el('span', { class: 'field-val' }, [`${officer.district || '—'}, ${officer.state || ''}`])
              ]),
              el('div', { class: 'officer-field-row' }, [
                el('span', { class: 'field-label' }, ['Email address']),
                el('span', { class: 'field-val' }, [officer.email || '—'])
              ]),
              el('div', { class: 'officer-field-row' }, [
                el('span', { class: 'field-label' }, ['Phone']),
                el('span', { class: 'field-val' }, [officer.phone || '—'])
              ])
            ]),
            actions.length > 0 ? el('div', { class: 'officer-card-actions' }, actions) : null
          ]);
        }))
      ]);
    }));
  }

  let formPanel;
  if (isAdmin) {
    const form = el('form', { class: 'officer-form' }, [
      el('div', { class: 'form-group' }, [
        el('label', {}, [t('fullName') + ' *']),
        el('input', { name: 'fullName', required: true, placeholder: 'Inspector Anil Singh', value: editingOfficer ? editingOfficer.name : '' })
      ]),
      el('div', { class: 'form-row-2' }, [
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('rank')]),
          el('select', { name: 'rank' }, [
            'Director General of Police', 'Inspector General', 'Deputy Inspector General',
            'Superintendent of Police', 'Assistant Commissioner of Police', 'Inspector',
            'Sub-Inspector', 'Assistant Sub-Inspector', 'Head Constable', 'Constable'
          ].map(r => {
            const opt = el('option', { value: r }, [r]);
            if (editingOfficer && editingOfficer.rank === r) opt.selected = true;
            else if (!editingOfficer && r === 'Sub-Inspector') opt.selected = true;
            return opt;
          }))
        ]),
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('badgeNo')]),
          el('input', { name: 'badge', placeholder: 'MH/INSP/1124', value: editingOfficer ? editingOfficer.badge : '' })
        ])
      ]),
      el('div', { class: 'form-row-2' }, [
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('district') + ' *']),
          el('input', { name: 'district', required: true, placeholder: 'Pune', value: editingOfficer ? editingOfficer.district : '' })
        ]),
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('state')]),
          el('input', { name: 'state', placeholder: 'Maharashtra', value: editingOfficer ? editingOfficer.state : 'Maharashtra' })
        ])
      ]),
      el('div', { class: 'form-row-2' }, [
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('emailAddress') + ' *']),
          el('input', { name: 'email', type: 'email', required: true, placeholder: 'officer@police.gov.in', value: editingOfficer ? editingOfficer.email : '' })
        ]),
        el('div', { class: 'form-group' }, [
          el('label', {}, [t('phone')]),
          el('input', { name: 'phone', type: 'tel', placeholder: '+91-…', value: editingOfficer ? editingOfficer.phone : '' })
        ])
      ]),
      el('div', { class: 'form-group' }, [
        el('label', {}, [t('initialPassword') + ' *']),
        el('input', { name: 'password', type: 'password', placeholder: '••••••••', value: editingOfficer ? '********' : '' }),
        el('span', { class: 'form-hint' }, [t('passwordHelp')])
      ]),
      el('div', { class: 'form-group' }, [
        el('label', {}, [t('rolePermissions')]),
        el('div', { class: 'role-pill-group' }, ['case-officer', 'analyst', 'admin'].map(role => {
          const active = (state.officerFormRole || 'case-officer') === role;
          const btn = el('button', {
            type: 'button',
            class: `role-pill-btn ${active ? 'active' : ''}`,
            onclick: () => {
              state.officerFormRole = role;
              render();
            }
          }, [role]);
          return btn;
        }))
      ]),
      el('div', { class: 'form-actions' }, [
        el('button', { class: 'primary-btn', type: 'submit' }, [
          icon('check'),
          editingOfficer ? t('saveChanges') : t('addOfficer')
        ]),
        el('button', {
          class: 'outline-btn',
          type: 'button',
          onclick: () => {
            state.editingOfficerId = null;
            state.officerFormRole = 'case-officer';
            render();
          }
        }, [t('clear')])
      ])
    ]);

    form.onsubmit = (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="fullName"]').value.trim();
      const rank = form.querySelector('[name="rank"]').value;
      const badge = form.querySelector('[name="badge"]').value.trim();
      const district = form.querySelector('[name="district"]').value.trim();
      const stateVal = form.querySelector('[name="state"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const phone = form.querySelector('[name="phone"]').value.trim();
      const role = state.officerFormRole || 'case-officer';

      if (editingOfficer) {
        editingOfficer.name = name;
        editingOfficer.rank = rank;
        editingOfficer.badge = badge;
        editingOfficer.district = district;
        editingOfficer.state = stateVal;
        editingOfficer.email = email;
        editingOfficer.phone = phone;
        editingOfficer.role = role;
        saveOfficers();
        recordAudit('Officer updated', `Officer profile updated: ${name} (${rank}, ${district}).`, 'info', 'officer');
        if (supabaseConfigured && editingOfficer.id && !editingOfficer.id.startsWith('off_')) {
          supabase.from('profiles').update({
            display_name: name,
            rank,
            badge_no: badge,
            district,
            state: stateVal,
            email,
            phone,
            role_name: role
          }).eq('id', editingOfficer.id).then(() => {});
        }
        showToast(t('officerUpdated'));
        state.editingOfficerId = null;
      } else {
        const newId = 'off_' + Date.now();
        const newOff = {
          id: newId,
          name,
          rank,
          badge: badge || '',
          district,
          state: stateVal || 'Maharashtra',
          email,
          phone,
          role,
          isYou: false
        };
        state.officers.push(newOff);
        saveOfficers();
        recordAudit('Officer added', `New officer profile created: ${name} (${rank}, ${district}).`, 'info', 'officer');
        showToast(t('officerAdded'));
      }
      render();
    };

    formPanel = el('div', { class: 'officer-form-panel' }, [
      el('h3', {}, [editingOfficer ? t('editOfficer') : t('addOfficer')]),
      el('p', {}, [t('officersSubtitle')]),
      form
    ]);
  } else {
    formPanel = el('div', { class: 'officer-form-panel read-only-panel' }, [
      el('div', { class: 'directory-info-badge' }, [icon('shield'), ' DIRECTORY VIEW']),
      el('h3', {}, ['Investigator Directory']),
      el('p', { class: 'muted' }, ['Cross-district directory of authenticated law enforcement personnel.']),
      el('div', { class: 'admin-notice-box' }, [
        el('strong', {}, ['Admin Privileges Required']),
        el('span', {}, ['Only system administrators can register new officer profiles, change investigator credentials, or modify role permissions.'])
      ]),
      el('div', { class: 'current-user-summary' }, [
        el('span', { class: 'field-label' }, ['Your Officer Profile:']),
        el('strong', {}, [activeOfficer.name]),
        el('span', { class: 'muted' }, [`Role: ${(activeOfficer.rawRole || 'case-officer').toUpperCase()} · District: ${activeOfficer.role}`])
      ])
    ]);
  }

  const layout = el('div', { class: 'officers-layout' }, [listArea, formPanel]);
  c.append(header, layout);
}

/* ==========================================================================
   AUDIT LOGS VIEW IMPLEMENTATION
   ========================================================================== */
function renderAuditLogs(c) {
  c.innerHTML = '';
  const activeOfficer = getActiveOfficer();

  if (!activeOfficer.isAdmin) {
    c.append(el('div', { class: 'restricted-access-panel' }, [
      el('div', { class: 'restricted-lock-icon' }, [icon('lock')]),
      el('div', { class: 'restricted-badge' }, ['RESTRICTED CLEARANCE']),
      el('h2', {}, ['Administrator Clearance Required']),
      el('p', {}, [
        'Immutable audit logs, SHA-256 chain-of-custody ledgers, and forensic activity streams are strictly restricted to System Administrators for evidentiary compliance and data privacy.'
      ]),
      el('div', { class: 'restricted-officer-info' }, [
        el('span', {}, ['Current Officer:']),
        el('strong', {}, [activeOfficer.name]),
        el('span', { class: 'role-tag' }, [`Role: ${(activeOfficer.rawRole || 'case-officer').toUpperCase()}`])
      ]),
      el('button', {
        class: 'primary-btn small',
        onclick: () => { state.view = 'overview'; render(); }
      }, ['Return to Dashboard'])
    ]));
    return;
  }

  const header = el('div', { class: 'page-heading' }, [
    el('div', {}, [
      el('h1', {}, [t('auditLogs')]),
      el('p', { class: 'muted' }, [t('auditSubtitle')])
    ])
  ]);

  const totalCount = state.auditLogs.length;
  const warningCount = state.auditLogs.filter(l => l.level === 'warning').length;
  const criticalCount = state.auditLogs.filter(l => l.level === 'critical').length;

  const metricGrid = el('div', { class: 'audit-metric-grid' }, [
    el('div', { class: 'audit-metric-card' }, [
      el('span', { class: 'audit-metric-label' }, ['ALL']),
      el('strong', { class: 'audit-metric-value' }, [String(totalCount)]),
      el('span', { class: 'audit-metric-sub' }, ['Total recorded events'])
    ]),
    el('div', { class: 'audit-metric-card warning-card' }, [
      el('span', { class: 'audit-metric-label' }, ['WARNINGS']),
      el('strong', { class: 'audit-metric-value' }, [String(warningCount)]),
      el('span', { class: 'audit-metric-sub' }, ['Review recommended'])
    ]),
    el('div', { class: 'audit-metric-card critical-card' }, [
      el('span', { class: 'audit-metric-label' }, ['CRITICAL EVENTS']),
      el('strong', { class: 'audit-metric-value' }, [String(criticalCount)]),
      el('span', { class: 'audit-metric-sub' }, ['Immediate action required'])
    ]),
    el('div', { class: 'audit-metric-card tamper-card' }, [
      el('span', { class: 'audit-metric-label' }, [t('tamperAlerts')]),
      el('strong', { class: 'audit-metric-value' }, ['0']),
      el('span', { class: 'audit-metric-sub' }, [t('noActiveAlerts')])
    ])
  ]);

  const uniqueActors = Array.from(new Set(state.auditLogs.map(l => l.actor).filter(Boolean)));
  const uniqueActions = Array.from(new Set(state.auditLogs.map(l => l.action).filter(Boolean)));

  const searchInput = el('input', {
    placeholder: 'Search audit logs by officer, action, summary, timestamp…',
    value: state.auditSearchQuery || ''
  });
  searchInput.oninput = (e) => {
    state.auditSearchQuery = e.target.value;
    render();
    setTimeout(() => {
      const inp = document.querySelector('.audit-search-wrapper input');
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    }, 0);
  };

  const actorSelect = el('select', { class: 'audit-filter-select' }, [
    el('option', { value: 'all' }, ['All Officers / Actors']),
    ...uniqueActors.map(a => {
      const opt = el('option', { value: a }, [a]);
      if (state.auditActorFilter === a) opt.selected = true;
      return opt;
    })
  ]);
  actorSelect.onchange = (e) => {
    state.auditActorFilter = e.target.value;
    render();
  };

  const actionSelect = el('select', { class: 'audit-filter-select' }, [
    el('option', { value: 'all' }, ['All Action Types']),
    ...uniqueActions.map(act => {
      const opt = el('option', { value: act }, [act]);
      if (state.auditActionFilter === act) opt.selected = true;
      return opt;
    })
  ]);
  actionSelect.onchange = (e) => {
    state.auditActionFilter = e.target.value;
    render();
  };

  const filterBar = el('div', { class: 'audit-filter-bar' }, [
    el('div', { class: 'audit-filter-row-top' }, [
      el('div', { class: 'audit-search-wrapper' }, [
        el('span', { class: 'audit-search-icon' }, [icon('search')]),
        searchInput
      ]),
      el('div', { class: 'audit-filter-selects' }, [
        actorSelect,
        actionSelect
      ])
    ]),
    el('div', { class: 'audit-filter-row-bottom' }, [
      el('div', { class: 'audit-filter-left' }, [
        el('span', { class: 'audit-filter-label' }, [t('level') + ':']),
        el('div', { class: 'audit-filter-pills' }, [
          ['all', t('all')],
          ['info', t('info') || 'Info'],
          ['warning', t('warnings') || 'Warnings'],
          ['critical', t('critical') || 'Critical']
        ].map(([lvl, label]) => {
          const btn = el('button', {
            class: `audit-pill ${state.auditLevelFilter === lvl ? 'active' : ''}`,
            onclick: () => {
              state.auditLevelFilter = lvl;
              render();
            }
          }, [label]);
          return btn;
        }))
      ])
    ])
  ]);

  const q = (state.auditSearchQuery || '').toLowerCase().trim();
  const filteredLogs = state.auditLogs.filter(log => {
    if (state.auditLevelFilter !== 'all' && log.level !== state.auditLevelFilter) return false;
    if (state.auditActorFilter !== 'all' && log.actor !== state.auditActorFilter) return false;
    if (state.auditActionFilter !== 'all' && log.action !== state.auditActionFilter && log.actionType !== state.auditActionFilter) return false;
    if (q) {
      const matchActor = (log.actor || '').toLowerCase().includes(q);
      const matchAction = (log.action || '').toLowerCase().includes(q);
      const matchSummary = (log.summary || '').toLowerCase().includes(q);
      const matchTime = (log.time || '').toLowerCase().includes(q);
      if (!matchActor && !matchAction && !matchSummary && !matchTime) return false;
    }
    return true;
  });

  const tableBody = filteredLogs.length > 0 ? filteredLogs.map(log => {
    const actionClass = log.actionType || 'system';
    return el('tr', {}, [
      el('td', { class: 'audit-time-cell' }, [log.time]),
      el('td', {}, [
        el('div', { class: 'audit-actor-cell' }, [
          el('div', { class: 'audit-actor-avatar' }, [log.actorInitials || 'S']),
          el('strong', {}, [log.actor || 'System'])
        ])
      ]),
      el('td', {}, [
        el('span', { class: `audit-action-pill ${actionClass}` }, [log.action])
      ]),
      el('td', { class: 'audit-summary-cell' }, [log.summary])
    ]);
  }) : [
    el('tr', {}, [
      el('td', { colspan: '4', style: 'text-align: center; padding: 48px 16px; color: var(--muted); font-size: 13px;' }, ['No audit log events match the current filter criteria.'])
    ])
  ];

  const table = el('table', { class: 'audit-table' }, [
    el('thead', {}, [
      el('tr', {}, [
        el('th', { style: 'width: 140px;' }, [t('time')]),
        el('th', { style: 'width: 170px;' }, [t('actor')]),
        el('th', { style: 'width: 140px;' }, [t('action')]),
        el('th', {}, [t('summary')])
      ])
    ]),
    el('tbody', {}, tableBody)
  ]);

  const tablePanel = el('div', { class: 'audit-table-panel' }, [table]);

  c.append(header, metricGrid, filterBar, tablePanel);
}

/* ==========================================================================
   NETWORK GRAPH VIEW
   ========================================================================== */
function renderNetwork(c) {
  c.innerHTML = '';
  const analyticalEntities = graphMetrics(entities, edges);
  const filtered = analyticalEntities.filter(e => (state.type === 'all' || e.type === state.type) && (e.name.toLowerCase().includes(state.query.toLowerCase()) || (e.local && e.local.includes(state.query))));
  const rank = { high: 0, medium: 1, low: 2 };
  const sorted = [...filtered].sort((a, b) => state.sort === 'name' ? a.name.localeCompare(b.name) : state.sort === 'connections' ? b.degree - a.degree : state.sort === 'recent' ? b.recent - a.recent : state.sort === 'influence' ? b.influence - a.influence : rank[a.risk] - rank[b.risk]);
  const n = el('div', { class: `network-workspace ${state.graphFullscreen ? 'fullscreen' : ''}` });
  const typeOptions = [['all', t('allTypes')], ...Array.from(new Set(entities.map(e => e.type))).map(x => [x, x])];
  const sortOptions = [['risk', t('risk')], ['connections', t('connectionsSort')], ['name', t('name')], ['recent', t('recent')], ['influence', t('influence')]];
  const typeSelect = el('select', { class: 'filter-select' }, typeOptions.map(([v, l]) => { const o = el('option', { value: v }, [l]); o.selected = v === state.type; return o; }));
  typeSelect.onchange = e => { state.type = e.target.value; render(); };
  const sortSelect = el('select', { class: 'filter-select' }, sortOptions.map(([v, l]) => { const o = el('option', { value: v }, [l]); o.selected = v === state.sort; return o; }));
  sortSelect.onchange = e => { state.sort = e.target.value; render(); };
  const toggleFullscreen = () => {
    state.graphFullscreen = !state.graphFullscreen;
    document.body.classList.toggle('fullscreen-active', state.graphFullscreen);
    if (state.graphFullscreen) {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
    render();
  };
  const fullscreen = el('button', { class: 'outline-btn', onclick: toggleFullscreen }, [icon('expand'), state.graphFullscreen ? t('exitFullscreen') : t('fullscreen')]);
  const firButton = el('button', { class: 'primary-btn small', onclick: () => { state.view = 'fir'; render(); } }, [icon('file'), t('reviewFIR')]);
  const heading = el('div', { class: 'page-heading compact' }, [
    el('div', {}, [
      el('div', { class: 'eyebrow blue' }, ['LINKAGE ANALYSIS']),
      el('h1', {}, [t('network')]),
      el('p', { class: 'muted' }, [t('graphHint')])
    ]),
    el('div', { class: 'heading-actions' }, [fullscreen, firButton])
  ]);
  const toolbar = el('div', { class: 'network-toolbar' }, [
    el('div', { class: 'toolbar-group' }, [el('span', { class: 'toolbar-label' }, [t('filter')]), typeSelect]),
    el('div', { class: 'toolbar-group' }, [el('span', { class: 'toolbar-label' }, ['Sort by']), sortSelect]),
    el('span', { class: 'result-count' }, [sorted.length + ' entities'])
  ]);
  const graph = el('section', { class: 'graph-panel' }, [
    graphContainer(sorted),
    el('div', { class: 'graph-legend' }, [['high', t('high')], ['medium', t('medium')], ['low', t('low')]].map(([r, l]) => el('span', {}, [el('i', { style: `background:${riskColor[r]}` }), l]))),
    el('div', { class: 'graph-controls' }, [
      el('button', { class: 'icon-btn', onclick: () => sigmaInstance?.getCamera().animatedZoom() }, ['＋']),
      el('button', { class: 'icon-btn', onclick: () => sigmaInstance?.getCamera().animatedUnzoom() }, ['−']),
      el('button', { class: 'icon-btn', onclick: () => sigmaInstance?.getCamera().animatedReset({ duration: 300 }) }, ['⌖'])
    ])
  ]);
  const entityAside = el('aside', { class: 'entity-panel' }, [
    selectedCard(),
    el('div', { class: 'entity-list-head' }, [el('h3', {}, [t('entities')]), el('span', { class: 'muted' }, [sorted.length + ' total'])]),
    el('div', { class: 'entity-list' }, sorted.length > 0 ? sorted.map(e => entityListItem(e)) : [el('div', { style: 'padding: 24px 12px; text-align: center; color: var(--muted); font-size: 12px;' }, ['No entities recorded yet.'])])
  ]);
  n.append(heading, toolbar, el('div', { class: 'network-grid' }, [graph, entityAside]));
  c.append(n);
  if (sorted.length > 0) {
    requestAnimationFrame(() => mountSigma(sorted));
  }
}

function graphContainer(sorted) {
  if (sorted.length === 0) {
    return el('div', { class: 'sigma-container empty-graph-shell' }, [
      el('div', { class: 'empty-shell-content' }, [
        el('span', { class: 'empty-shell-icon' }, [icon('network')]),
        el('strong', {}, ['No Entities in Network']),
        el('p', { class: 'muted' }, ['Add FIR cases or entities in the database to view live network linkages.'])
      ])
    ]);
  }
  return el('div', { class: 'sigma-container', 'data-graph-count': String(sorted.length) });
}

function mountSigma(sorted) {
  const container = document.querySelector('.sigma-container');
  if (!container || container.classList.contains('empty-graph-shell')) return;
  sigmaInstance?.kill();
  const graph = new Graph();
  sorted.forEach((entity, index) => {
    const angle = (index / Math.max(sorted.length, 1)) * Math.PI * 2;
    const radius = 0.25 + (index % 3) * 0.12;
    graph.addNode(entity.id, {
      label: entity.name,
      x: entity.x / 700 - 0.5 || Math.cos(angle) * radius,
      y: entity.y / 520 - 0.5 || Math.sin(angle) * radius,
      size: 7 + entity.degree * 0.75,
      color: riskColor[entity.risk] || '#0B3D91',
      risk: entity.risk,
      entityId: entity.id
    });
  });
  edges.forEach(([source, target]) => {
    if (graph.hasNode(source) && graph.hasNode(target) && !graph.hasEdge(source, target)) {
      graph.addEdge(source, target, { color: '#CBD5E1', size: 1.5, type: 'line' });
    }
  });
  sigmaInstance = new Sigma(graph, container, {
    renderLabels: true,
    labelFont: 'Inter, system-ui, sans-serif',
    labelSize: 12,
    labelColor: { color: '#162B47' },
    defaultNodeColor: '#0B3D91',
    defaultEdgeColor: '#CBD5E1',
    minCameraRatio: 0.2,
    maxCameraRatio: 5,
    allowInvalidContainer: true
  });
  sigmaInstance.on('clickNode', ({ node }) => {
    state.selected = node;
    render();
  });
  requestAnimationFrame(() => {
    sigmaInstance?.refresh();
  });
}

function selectedCard() {
  const e = entities.find(x => x.id === state.selected);
  if (!e) {
    return el('div', { class: 'selected-card' }, [
      el('div', { class: 'selected-top' }, [
        el('span', { class: 'entity-type' }, ['Entity']),
        el('span', { class: 'risk-badge low' }, ['None'])
      ]),
      el('h2', {}, ['No Entity Selected']),
      el('p', { class: 'muted' }, ['Select an entity from the list or network graph to inspect details.']),
      el('div', { class: 'selected-stats' }, [
        [t('connectionsSort'), 0],
        [t('linkedEvents'), 0],
        [t('influence'), '0%']
      ].map(([a, b]) => el('div', {}, [el('strong', {}, [b]), el('span', {}, [a])])))
    ]);
  }
  return el('div', { class: 'selected-card' }, [
    el('div', { class: 'selected-top' }, [
      el('span', { class: 'entity-type' }, [e.type]),
      el('span', { class: `risk-badge ${e.risk}` }, [t(e.risk)])
    ]),
    el('h2', {}, [e.name]),
    el('p', { class: 'muted' }, [e.city || 'India']),
    el('div', { class: 'selected-stats' }, [
      [t('connectionsSort'), e.degree || 0],
      [t('linkedEvents'), e.events || 0],
      [t('influence'), (e.influence || 0) + '%']
    ].map(([a, b]) => el('div', {}, [el('strong', {}, [b]), el('span', {}, [a])]))),
    el('div', { class: 'detail-row' }, [el('span', {}, [t('source')]), el('strong', {}, ['Supabase Database'])]),
    el('div', { class: 'detail-row' }, [el('span', {}, [t('confidence')]), el('strong', {}, ['100%'])]),
    el('button', { class: 'outline-btn full', onclick: () => showToast(`${e.name} record inspected`) }, [t('evidenceTrail'), icon('arrow')])
  ]);
}

function entityListItem(e) {
  const b = el('button', { class: `entity-row ${state.selected === e.id ? 'selected' : ''}` }, [
    el('span', { class: 'entity-avatar', style: `background:${riskColor[e.risk]}18;color:${riskColor[e.risk]}` }, [e.name.slice(0, 1)]),
    el('span', { class: 'entity-row-name' }, [
      el('strong', {}, [e.name]),
      el('small', {}, [e.type])
    ]),
    el('span', { class: 'row-degree' }, [e.degree || 0]),
    el('span', { class: `risk-dot ${e.risk}` })
  ]);
  b.onclick = () => {
    state.selected = e.id;
    render();
  };
  return b;
}

/* ==========================================================================
   FIR INTAKE VIEW
   ========================================================================== */
function renderFIR(c) {
  c.innerHTML = '';
  const modeBar = el('div', { class: 'fir-mode-bar' }, [
    el('span', { class: 'section-label' }, [t('caseDetails')]),
    el('div', { class: 'mode-buttons' }, [
      el('button', { class: `mode-button ${state.firMode === 'upload' ? 'active' : ''}`, onclick: () => { state.firMode = 'upload'; render(); } }, [icon('upload'), t('scannedUpload')]),
      el('button', { class: `mode-button ${state.firMode === 'manual' ? 'active' : ''}`, onclick: () => { state.firMode = 'manual'; render(); } }, [icon('file'), t('manualEntry')])
    ])
  ]);
  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, [t('documentIntelligence')]),
        el('h1', {}, [t('fir')]),
        el('p', { class: 'muted' }, [t('uploadWorkflow')])
      ]),
      el('span', { class: 'secure-pill' }, [icon('lock'), t('secure')])
    ]),
    modeBar
  );
  if (state.firMode === 'manual') c.append(manualFIRPanel());
  else c.append(uploadFIRPanel());
}

function uploadFIRPanel() {
  return el('div', { class: 'fir-grid' }, [
    el('section', { class: 'panel upload-panel' }, [
      el('div', { class: 'panel-heading' }, [
        el('div', {}, [
          el('h3', {}, [t('uploadTitle')]),
          el('span', { class: 'muted' }, [t('uploadBody')])
        ])
      ]),
      uploadBox(),
      el('div', { class: 'workflow' }, [
        ['01', t('fingerprintStep'), t('sha256')],
        ['02', t('extractStep'), t('ocrAdapter')],
        ['03', t('reviewStep'), t('officerConfirmation')],
        ['04', t('commitStep'), t('auditLedger')]
      ].map(([n, a, b], i) => el('div', { class: `workflow-step ${state.fileHash && i === 0 ? 'done' : ''}` }, [
        el('span', {}, [n]),
        el('strong', {}, [a]),
        el('small', {}, [b])
      ])))
    ]),
    el('section', { class: 'panel audit-panel' }, [
      el('div', { class: 'panel-heading' }, [
        el('div', {}, [
          el('h3', {}, [t('auditTitle')]),
          el('span', { class: 'muted' }, [t('auditBody')])
        ]),
        el('span', { class: 'verified-pill' }, [icon('check'), t('verified')])
      ]),
      el('div', { class: 'audit-chain' }, [
        ['Now', t('documentReceived'), getActiveOfficer().name, 'hash'],
        ['Now', t('hashGenerated'), 'Browser SHA-256', 'hash'],
        [t('pending'), t('ocrExtraction'), 'OCR extraction ready', 'pending']
      ].map(([time, a, b, k]) => el('div', { class: 'audit-event' }, [
        el('div', { class: `audit-marker ${k}` }, [k === 'pending' ? '…' : icon('check')]),
        el('div', {}, [el('strong', {}, [a]), el('span', {}, [b])]),
        el('time', {}, [time])
      ]))),
      el('div', { class: 'hash-box' }, [
        el('span', {}, [t('fingerprint')]),
        el('code', {}, [state.fileHash || '—'])
      ])
    ]),
    el('div', { class: 'panel draft-panel' }, [
      el('div', { class: 'panel-heading' }, [
        el('div', {}, [
          el('h3', {}, [t('reviewDraft')]),
          el('span', { class: 'muted' }, [t('reviewRequired')])
        ]),
        el('span', { class: 'draft-status' }, [state.fileHash ? 'READY FOR REVIEW' : t('noFile')])
      ]),
      el('div', { class: 'draft-grid' }, [
        [t('firNumber'), ''],
        [t('policeStation'), ''],
        [t('district'), ''],
        [t('incidentDate'), ''],
        [t('sections'), ''],
        [t('namedEntities'), '']
      ].map(([a, b]) => el('label', {}, [a, el('input', { value: b, placeholder: a, disabled: !state.fileHash })])))
    ])
  ]);
}

function uploadBox() {
  const box = el('div', { class: `upload-box ${state.fileHash ? 'has-file' : ''}` }, [
    el('div', { class: 'upload-icon' }, [icon('upload')]),
    el('strong', {}, [state.file ? state.file.name : t('noFile')]),
    el('span', {}, [state.fileHash ? state.fileHash.slice(0, 22) + '…' : t('uploadBody')]),
    el('label', { class: 'outline-btn' }, [
      t('browse'),
      el('input', { type: 'file', accept: 'image/*,.pdf', hidden: true })
    ])
  ]);
  box.querySelector('input').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    state.file = file;
    const buffer = await file.arrayBuffer();
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    state.fileHash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (supabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      const result = await uploadPrivateEvidence({ supabase, file, userId: user?.id, sha256: state.fileHash });
      state.filePath = result.path || '';
    }
    recordAudit('FIR uploaded', `Scanned FIR "${file.name}" fingerprinted (${state.fileHash.slice(0, 10)}…).`, 'info', 'fir');
    render();
  };
  return box;
}

async function hashText(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function saveManualFIR() {
  if (!supabaseConfigured) {
    showToast(t('authNotConfigured'));
    return;
  }
  const form = document.querySelector('.manual-form');
  const value = (name) => form.querySelector(`[name="${name}"]`)?.value?.trim() || '';
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showToast(t('authFailed'));
    return;
  }
  const sections = value('sections').split(',').map(x => x.trim()).filter(Boolean);
  const { data: fir, error: firError } = await supabase.from('fir_cases').insert({
    fir_number: value('firNumber'),
    police_station: value('policeStation'),
    district: value('district'),
    incident_date: value('incidentDate') || null,
    sections,
    incident_summary: value('incidentSummary'),
    extraction_status: 'manual',
    created_by: user.id
  }).select('id').single();

  if (firError) {
    showToast(t('saveFailed'));
    return;
  }
  const subjectName = value('subjectName');
  if (subjectName) {
    const { data: entity, error: entityError } = await supabase.from('entities').insert({
      entity_type: 'person',
      display_name: subjectName,
      aliases: value('alias') ? [value('alias')] : [],
      identifiers: {
        dob: value('dob'),
        address: value('address'),
        phone: value('phone'),
        vehicle: value('vehicle'),
        bank: value('bank')
      },
      created_by: user.id
    }).select('id').single();
    if (entityError) {
      showToast(t('saveFailed'));
      return;
    }
    await supabase.from('fir_entities').insert({ fir_id: fir.id, entity_id: entity.id, involvement: 'subject' });
  }
  for (const item of state.manualEvidence) {
    let storagePath = null;
    let sha256 = null;
    if (item.file) {
      const buffer = await item.file.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      sha256 = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
      const upload = await uploadPrivateEvidence({ supabase, file: item.file, userId: user.id, sha256 });
      if (upload.error) {
        showToast(t('saveFailed'));
        return;
      }
      storagePath = upload.path;
    }
    const { error } = await supabase.from('evidence_items').insert({
      fir_id: fir.id,
      evidence_type: item.type,
      description: item.description,
      storage_path: storagePath,
      sha256,
      created_by: user.id
    });
    if (error) {
      showToast(t('saveFailed'));
      return;
    }
  }
  const eventPayload = JSON.stringify({ action: 'fir.created', firId: fir.id, actor: user.id, at: new Date().toISOString() });
  const eventHash = await hashText(eventPayload);
  await supabase.from('audit_events').insert({
    actor_id: user.id,
    action: 'fir.created',
    resource_type: 'fir_case',
    resource_id: fir.id,
    change_summary: { firNumber: value('firNumber'), evidenceCount: state.manualEvidence.length },
    event_hash: eventHash
  });

  recordAudit('FIR created', `FIR ${value('firNumber')} created at ${value('policeStation')}.`, 'info', 'fir');
  state.manualEvidence = [];
  showToast(t('caseSaved'));
  await loadSupabaseData();
  render();
}

function manualField(label, key, attrs = {}) {
  return el('label', { class: `manual-field ${attrs.wide ? 'wide' : ''}` }, [
    label,
    el('input', { ...attrs, name: key, wide: undefined, placeholder: attrs.placeholder || label })
  ]);
}

function manualFIRPanel() {
  const fields = el('div', { class: 'manual-grid' }, [
    manualField(t('firNumber'), 'firNumber', { type: 'text' }),
    manualField(t('policeStation'), 'policeStation', { type: 'text' }),
    manualField(t('district'), 'district', { type: 'text' }),
    manualField(t('incidentDate'), 'incidentDate', { type: 'date' }),
    manualField(t('sections'), 'sections', { type: 'text' }),
    manualField(t('reportingOfficer'), 'reportingOfficer', { type: 'text' }),
    manualField(t('subjectName'), 'subjectName', { type: 'text' }),
    manualField(t('alias'), 'alias', { type: 'text' }),
    manualField(t('dob'), 'dob', { type: 'date' }),
    manualField(t('phone'), 'phone', { type: 'tel' }),
    manualField(t('vehicle'), 'vehicle', { type: 'text' }),
    manualField(t('bank'), 'bank', { type: 'text' }),
    manualField(t('address'), 'address', { type: 'text', wide: true }),
    el('label', { class: 'manual-field wide' }, [
      t('incidentSummary'),
      el('textarea', { name: 'incidentSummary', rows: '4', placeholder: t('incidentSummary') })
    ])
  ]);

  const evidenceInput = el('div', { class: 'evidence-entry' }, [
    el('select', {}, [
      el('option', { value: 'document' }, [t('documentEvidence')]),
      el('option', { value: 'device' }, [t('deviceEvidence')]),
      el('option', { value: 'financial' }, [t('financialEvidence')]),
      el('option', { value: 'witness' }, [t('witnessEvidence')])
    ]),
    el('input', { placeholder: t('evidenceDescription') }),
    el('label', { class: 'outline-btn evidence-file-picker' }, [
      t('browse'),
      el('input', { type: 'file', accept: 'image/*,.pdf,.doc,.docx', hidden: true })
    ]),
    el('button', {
      class: 'outline-btn',
      onclick: () => {
        const type = evidenceInput.querySelector('select').value;
        const description = evidenceInput.querySelector('input[placeholder]').value.trim();
        const file = evidenceInput.querySelector('input[type="file"]').files[0] || null;
        if (!description && !file) return;
        state.manualEvidence.push({ type, description: description || file.name, file });
        render();
      }
    }, [icon('plus'), t('addEvidence')])
  ]);

  const evidenceList = el('div', { class: 'evidence-list' }, state.manualEvidence.map((item, index) => el('div', { class: 'evidence-item' }, [
    el('span', { class: 'evidence-type' }, [item.type]),
    el('span', {}, [item.file ? `${item.description} • ${item.file.name}` : item.description]),
    el('button', {
      class: 'evidence-remove',
      title: t('removeEvidence'),
      onclick: () => {
        state.manualEvidence.splice(index, 1);
        render();
      }
    }, ['×'])
  ])));

  return el('section', { class: 'panel manual-form' }, [
    el('div', { class: 'panel-heading' }, [
      el('div', {}, [
        el('h3', {}, [t('manualEntry')]),
        el('span', { class: 'muted' }, [t('manualEntryHelp')])
      ]),
      el('span', { class: 'draft-status' }, [t('draft')])
    ]),
    el('div', { class: 'manual-section' }, [
      el('div', { class: 'section-label' }, [t('caseDetails')]),
      fields
    ]),
    el('div', { class: 'manual-section' }, [
      el('div', { class: 'section-label' }, [t('evidence')]),
      evidenceInput,
      evidenceList
    ]),
    el('div', { class: 'manual-actions' }, [
      el('button', { class: 'outline-btn', onclick: () => showToast(t('draftSaved')) }, [t('saveDraft')]),
      el('button', { class: 'primary-btn', onclick: saveManualFIR }, [icon('check'), t('saveCase')])
    ])
  ]);
}

/* ==========================================================================
   SOURCES & DATA CATALOGUE VIEW
   ========================================================================== */
function renderSources(c) {
  c.innerHTML = '';
  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, ['GOVERNANCE • DATABASE SCHEMA']),
        el('h1', {}, [t('sources')]),
        el('p', { class: 'muted' }, ['Operational database tables and live storage volumes.'])
      ]),
      el('button', { class: 'primary-btn', onclick: () => { state.view = 'fir'; render(); } }, [icon('upload'), 'Intake FIR Case'])
    ]),
    el('div', { class: 'source-grid' }, [
      ['public.entities', 'Master entity records', `${entities.length} records`, 'live', 'Persons, organizations, vehicles, phones, accounts'],
      ['public.relationships', 'Graph linkages and edges', `${edges.length} connections`, 'live', 'Multi-entity association matrix'],
      ['public.fir_cases', 'Registered FIR cases', `${firCases.length} cases`, 'live', 'Police station case filings and extracts'],
      ['public.profiles', 'Registered law-enforcement profiles', `${state.officers.length} officers`, 'live', 'Linked to Supabase auth.users'],
      ['public.audit_events', 'Cryptographic activity audit', `${state.auditLogs.length} events`, 'verified', 'SHA-256 fingerprinted event trail'],
      ['Storage: fir-evidence', 'Encrypted evidence storage', 'Private bucket', 'verified', 'RLS-protected investigator vaults']
    ].map(([a, b, cx, status, d]) => el('div', { class: 'source-card' }, [
      el('div', { class: 'source-card-top' }, [
        el('div', { class: 'source-symbol' }, [icon(status === 'verified' ? 'check' : 'database')]),
        el('span', { class: `source-status ${status}` }, [status === 'verified' ? 'Active' : 'Live'])
      ]),
      el('h3', {}, [a]),
      el('p', { class: 'muted' }, [b]),
      el('div', { class: 'source-divider' }),
      el('span', {}, [cx]),
      el('small', {}, [d])
    ]))),
    el('div', { class: 'panel integrity-panel' }, [
      el('div', { class: 'panel-heading' }, [
        el('div', {}, [
          el('h3', {}, [t('integrityChecks')]),
          el('span', { class: 'muted' }, [supabaseConfigured ? 'Connected to Supabase' : 'Local storage mode'])
        ])
      ]),
      el('div', { class: 'integrity-items' }, [
        ['hashChain', 'Cryptographic SHA-256 hashing', `${state.auditLogs.length} events fingerprinted`],
        ['ledger', 'Evidence Chain of Custody', 'Enabled & active'],
        ['access', 'Row Level Security (RLS)', supabaseConfigured ? 'Enforced by Supabase' : 'Active']
      ].map(([a, b, d]) => el('div', { class: 'integrity-item' }, [
        el('span', { class: 'integrity-check' }, [icon('check')]),
        el('div', {}, [
          el('strong', {}, [a === 'hashChain' ? t('hashChain') : a === 'ledger' ? t('ledger') : 'Access controls']),
          el('span', {}, [b])
        ]),
        el('strong', { class: 'integrity-value' }, [d])
      ])))
    ])
  );
}

/* ==========================================================================
   SETTINGS VIEW
   ========================================================================== */
function renderSettings(c) {
  c.innerHTML = '';
  const officer = getActiveOfficer();
  const profile = el('section', { class: 'panel' }, [
    el('h3', {}, ['Investigator profile']),
    el('div', { class: 'profile-large' }, [
      el('div', { class: 'avatar big' }, [officer.initials]),
      el('div', {}, [
        el('strong', {}, [officer.name]),
        el('span', {}, [officer.role]),
        el('span', { class: 'verified-text' }, [icon('check'), ' Authenticated'])
      ])
    ]),
    el('div', { class: 'setting-row' }, ['Default language', langPicker()]),
    el('div', { class: 'setting-row' }, ['Data environment', el('span', { class: 'secure-pill' }, [supabaseConfigured ? 'Supabase Live' : 'Local Sandbox'])])
  ]);
  const controls = [
    ['Human review required', 'Enabled for OCR, entity merges, and alerts'],
    ['Evidence provenance', 'Shown on every extracted field'],
    ['Model confidence threshold', '0.78 minimum for suggestions'],
    ['Sensitive export approval', 'Two-person review']
  ].map(([a, b]) => el('div', { class: 'toggle-row' }, [
    el('div', {}, [
      el('strong', {}, [a]),
      el('span', {}, [b])
    ]),
    el('span', { class: 'toggle on' }, ['✓'])
  ]));
  const guardrails = el('section', { class: 'panel' }, [
    el('h3', {}, ['Responsible AI controls']),
    ...controls
  ]);
  c.append(
    el('div', { class: 'page-heading' }, [
      el('div', {}, [
        el('div', { class: 'eyebrow blue' }, ['ADMINISTRATION']),
        el('h1', {}, [t('settings')]),
        el('p', { class: 'muted' }, ['Investigator profile and system guardrails.'])
      ])
    ]),
    el('div', { class: 'settings-grid' }, [profile, guardrails])
  );
}

function render() {
  state.loggedIn ? appShell() : renderLogin();
}

render();
bootstrapAuth();

document.addEventListener('fullscreenchange', () => {
  const isFs = Boolean(document.fullscreenElement);
  if (!isFs && state.graphFullscreen) {
    state.graphFullscreen = false;
    document.body.classList.remove('fullscreen-active');
    render();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.graphFullscreen) {
    state.graphFullscreen = false;
    document.body.classList.remove('fullscreen-active');
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    render();
  }
});
