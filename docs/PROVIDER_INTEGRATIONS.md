# CME Certificate Provider APIs and Integration Guide

## Overview

This document outlines the current integration options available for medical CME certificate providers. The research reveals that most major CME providers do **not** expose public APIs for third-party applications. Instead, they typically rely on web services for LMS integration, automated transcript sharing, and credential reporting partnerships.

---

## 1. AMA Ed Hub (American Medical Association)

### Platform Overview
- **URL**: https://edhub.ama-assn.org/
- **Type**: Learning platform and CME tracking system
- **Target Users**: AMA members and healthcare professionals

### API Availability
- **Public API**: Not publicly documented
- **Status**: No official public API available for third-party developers

### CME Data Access Methods

#### 1.1 Transcript App
- **Platform**: Mobile app (iOS available)
- **URL**: https://apps.apple.com/us/app/ama-ed-hub-transcript/id1519451874
- **Capabilities**:
  - Users can download and access CME transcripts
  - View certificates and awards
  - Manual export of transcript data
  - Not an automated data access mechanism

#### 1.2 LMS Integration
- The AMA has integrated Ed Hub with multiple LMS platforms including Absorb
- When a user completes a CME activity in Ed Hub, credits are automatically reported to their LMS
- **Key Feature**: Seamless credit reporting to curriculum tracking systems
- **Implementation**: Done through partnerships (e.g., TXI Digital collaborated with AMA on Absorb integration)

#### 1.3 Automatic Board Reporting
- AMA members can automatically share CME credits and MOC points with 15+ medical boards
- **Status**: Automatic credential reporting is built-in for partnered boards
- **Future Direction**: AMA is working to improve account merging and CME data reconciliation

### Authentication
- **Method**: AMA account username/password
- **Support Page**: https://support.edhub.com/hc/en-us/articles/31869185970452-How-do-I-sign-into-AMA-Ed-Hub
- **OAuth/API Keys**: Not available for public use

### Partnership and Developer Program

#### Contact Information
- **General Support**: https://education.ama-assn.org/help
- **Support Portal**: https://support.edhub.com/hc/en-us
- **Phone**: (800) 262-3211 (AMA Member Service Center)

#### Partnership Status
- **Type**: Enterprise integrations only
- **Previous Implementations**:
  - Silverchair (2019) - Platform development
  - TXI Digital - LMS integrations
  - Absorb LMS - Curriculum reporting
- **Requirements**: Direct negotiation with AMA required
- **Cost**: Likely negotiated based on partnership scope

### Licensing Requirements
- No public information available
- Likely requires business partnership agreement
- Data sharing agreements required for transcript access

### Alternative Data Access
Users can manually export transcripts through the Ed Hub Transcript App or web interface, but this is not suitable for automated integrations.

---

## 2. AAFP (American Academy of Family Physicians)

### Platform Overview
- **URL**: https://www.aafp.org/cme.html
- **Primary CME Platform**: Primary+ (members-only)
- **Type**: CME tracking and professional portfolio

### API Availability
- **Public API**: Not available
- **Status**: No documented public API for third-party developers

### CME Data Access Methods

#### 2.1 Primary+ Portfolio
- **Availability**: AAFP members only
- **Capabilities**:
  - CME credit tracking
  - Requirements planning
  - Procedure tracker
  - Professional portfolio management
  - Some automatic credit reporting from partnered providers

#### 2.2 CME Reporting
- **Manual Reporting**: https://www.aafp.org/cme/reporting
- **Method**: Login with membership ID and password
- **Supported Boards**: Automatic reporting to select boards when available

#### 2.3 Automatic Credit Transfer
- Some CME providers automatically report credits to AAFP
- Not all providers integrate automatically
- Members must manually verify and report missing credits

### Authentication
- **Method**: AAFP membership number + password
- **Contact for Reporting**: contactcenter@aafp.org

### Partnership and Developer Program

#### Available Information
- AAFP has a Partner Program with multiple levels (Enthusiast level benefits listed)
- **URL**: https://www.aafp.org/about/partner/enthusiast-level-benefits.html
- **Specifics**: Limited public information about API partnership program

#### Contact for Integration
- Partner Program inquiries should be directed to AAFP directly
- No public developer documentation available

#### Licensing and Cost
- No public pricing available
- Likely requires partnership agreement
- Partner program levels suggest tiered benefits

### Alternative Data Access
Manual web interface access only; no automated third-party data sync available.

---

## 3. ACCME (Accreditation Council for Continuing Medical Education)

### Platform Overview
- **URL**: https://accme.org/
- **Primary System**: PARS (Program and Activity Reporting System)
- **Type**: Regulatory reporting and CME tracking authority

### API Availability

#### 3.1 ACCME PARS Web Services
- **Status**: Yes, official web services available
- **Type**: XML-based web services (not REST)
- **Documentation**: https://accme.org/resource/accme-pars-web-services/
- **Supplemental Guide**: https://accme.org/wp-content/uploads/2024/05/804_03022021_PARS_Web_Service_Supplemental_Guide_REMS.pdf

#### 3.2 Purpose
- Direct integration for CME providers and LMS platforms
- Submit activity and learner completion data to PARS
- Reduce manual data entry and batch uploads
- Enable automated credit reporting to medical boards

### PARS Web Services Details

#### Authentication
- **Method**: PARS account credentials
- **Type**: Provider/LMS credentials (not individual physician OAuth)
- **Access Level**: Requires PARS provider account and authorization

#### Data Submission
- **Protocol**: SOAP/XML web services
- **Data Types**:
  - CME activities
  - Learner completion records
  - Credit information
  - Physician demographics (name, license, location)
- **Validation**: Server-side validation during submission

#### Implementation Requirements
- Requires modification of LMS or CME provider software
- Technical implementation guide provided by ACCME
- Test site available for development and testing

### Documentation and Resources

#### Official Documentation
- Main page: https://accme.org/resource/accme-pars-web-services/
- Batch upload guide: https://accme.org/resource/submit-data-via-batch-upload-or-web-services/
- Release notes: http://accme.org/data-reporting/pars/release-notes/
- FAQ: https://accme.org/data-reporting/data-reporting-quick-answers/
- Activity tutorial: https://accme.org/wp-content/uploads/2024/05/936_20211116_CME-Activity-Tutorial.pdf

#### LMS Implementation Examples
- EthosCE LMS documentation on PARS integration: https://gocadmium.atlassian.net/wiki/spaces/ECE/pages/54001690/PARS+and+JA+PARS+ACCME+Web+Service+-+ADD+ON

### Developer Support
- **Type**: Documented web services with technical specifications
- **Support**: ACCME provides implementation guides and test infrastructure
- **No Cost**: Standard PARS service (no additional API fees documented)

### Innovation Partners Program
- **URL**: https://accme.org/data-reporting/pars/innovation-partners-2/
- **Description**: Partnership program for advancing learner data reporting systems
- **Partners**: Work with ACCME, state boards, and certifying boards

### CME Passport (Physician Portal)
- **URL**: https://accme.org/for-physicians/about-cme-passport/
- **Purpose**: Physician-facing portal to access CME transcript data reported to PARS
- **Access**: Physicians can create free profile and download transcripts

---

## 4. Other Major CME Providers

### American College of Physicians (ACP)
- **CME Reporting**: https://www.acponline.org/cme-moc/internal-medicine-cme/view-cme-transcripts
- **Type**: Manual transcript viewing and reporting
- **API**: Not publicly documented

### American College of Surgeons (ACS)
- **Platform**: MyCME
- **URL**: https://www.facs.org/for-medical-professionals/education/tools-and-platforms/mycme/
- **Integration**: Collaborates with ACCME for automatic reporting to American Board of Surgery
- **API**: Not publicly documented

### American College of Occupational and Environmental Medicine (ACOEM)
- **Transcript Access**: https://acoem.org/Learning/Continuing-Medical-Education/CME-Transcript
- **Type**: Manual transcript access
- **API**: Not publicly documented

---

## 5. Integration Architecture Patterns

### Pattern 1: Provider-to-Board Direct Reporting
```
CME Provider → ACCME PARS Web Services → Medical Licensing Board
└─ Automatic credit reporting for physicians
```

### Pattern 2: LMS Integration
```
Learning Management System ↔ ACCME PARS Web Services
└─ Automatic submission of completion data
```

### Pattern 3: User-Initiated Export
```
CME Platform → Manual Download/Export
└─ User downloads transcript and manually uploads to tracking system
```

### Pattern 4: OAuth/SSO (Limited)
- AMA Ed Hub can integrate with some LMS platforms using account linking
- Primary method is not OAuth but rather automated credit reporting once LMS is connected

---

## 6. Implementation Approaches for CME Tracking App

### Approach 1: ACCME PARS Integration (Recommended for Comprehensive Coverage)

**Pros:**
- Official, documented web services
- Covers all ACCME-accredited CME providers
- Automatic physician board reporting
- Direct connection to medical licensing boards
- Test environment available

**Cons:**
- Requires PARS provider account (may require institutional affiliation)
- XML/SOAP technology (legacy but functional)
- Data flows TO PARS, not FROM individual providers in real-time

**Implementation Steps:**
1. Contact ACCME for PARS account setup
2. Implement SOAP client for PARS web services
3. Map CME completion data to PARS format
4. Submit activities and learner data to PARS web services endpoint
5. Validate using ACCME test site

**Contact:** https://accme.org/

### Approach 2: Provider-Specific Partnerships

**For AMA Ed Hub:**
- Contact AMA partnership team directly
- Likely requires enterprise agreement
- Previous examples: Silverchair, TXI Digital, Absorb LMS

**For AAFP:**
- Inquire about Partner Program
- Contact: AAFP directly through partner program page

**Pros:**
- Direct API/integration with provider
- Real-time CME data access
- Custom implementation possible

**Cons:**
- Case-by-case negotiation
- May require revenue sharing
- Limited to single provider

### Approach 3: User-Managed Import

**Method:**
- Provide users ability to upload transcripts or certificate images
- Users manually export CME transcripts from providers
- Application parses and stores transcript data

**Pros:**
- Works with all CME providers
- No API dependencies
- Users maintain control

**Cons:**
- Manual process (not automated)
- User burden high
- Data accuracy depends on user input quality
- Transcript formats vary by provider

### Approach 4: Hybrid Approach

**Combination:**
1. ACCME PARS integration for automated board reporting
2. OAuth/SSO with major providers where available (AMA, AAFP, ACP)
3. Manual import fallback for other providers

**Pros:**
- Best coverage
- Balances automation and user control
- Supports all providers
- Follows physician workflow

**Cons:**
- Complex implementation
- Multiple data sources to reconcile
- Requires handling multiple authentication methods

---

## 7. Technical Considerations

### Data Standards
- **AMA Ed Hub**: Proprietary format
- **AAFP**: Proprietary format
- **ACCME PARS**: XML-based submission format
- **CME Transcripts**: Typically PDF with variable structure

### Physician Data Requirements
- Full name
- License number
- State of licensure
- Month and day of birth (for some providers)
- Email address
- Professional credentials

### Security and Compliance
- **HIPAA**: Not directly applicable (CME is not PHI), but protect physician credentials
- **Data Privacy**: Physician CME data is sensitive professional information
- **Credential Protection**: Store license numbers and birth dates securely
- **Authentication**: Use secure credential storage and transmission

### Regulatory Considerations
- ACCME accreditation requirements
- State medical board regulations
- Professional board requirements (ABIM, ABFM, etc.)
- PARS data validation rules

---

## 8. Contact Information and Resources

### Primary Contacts

#### ACCME
- **Website**: https://accme.org/
- **PARS Documentation**: https://accme.org/data-reporting/pars/
- **For Physicians**: https://accme.org/for-physicians/
- **CME Providers**: https://accme.org/cme-provider-directory/

#### AMA
- **Ed Hub**: https://edhub.ama-assn.org/
- **Support Portal**: https://support.edhub.com/hc/en-us
- **Member Service**: (800) 262-3211
- **Help/Contact**: https://education.ama-assn.org/help

#### AAFP
- **CME Services**: https://www.aafp.org/cme.html
- **CME Reporting**: https://www.aafp.org/cme/reporting
- **CME Contact**: contactcenter@aafp.org
- **Partner Program**: https://www.aafp.org/about/partner/enthusiast-level-benefits.html

#### ACP
- **Transcripts**: https://www.acponline.org/cme-moc/internal-medicine-cme/view-cme-transcripts

#### ACS
- **MyCME**: https://www.facs.org/for-medical-professionals/education/tools-and-platforms/mycme/

### Developer Resources
- ACCME PARS Web Services Guide: https://accme.org/resource/accme-pars-web-services/
- PARS Supplemental Guide: https://accme.org/wp-content/uploads/2024/05/804_03022021_PARS_Web_Service_Supplemental_Guide_REMS.pdf
- EthosCE LMS Integration Example: https://gocadmium.atlassian.net/wiki/spaces/ECE/pages/54001690/PARS+and+JA+PARS+ACCME+Web+Service+-+ADD+ON

---

## 9. Recommendations

### For MVP (Minimum Viable Product)
1. **Implement ACCME PARS Web Services** for core CME tracking
2. **Add manual transcript import** for providers not using PARS
3. **Provide secure credential storage** for physician data
4. **Build transcript parsing** for common formats (PDF, CSV)

### For Production
1. **Establish PARS provider account** with ACCME
2. **Implement SOAP client** for PARS web services
3. **Add OAuth/SSO support** for AMA, AAFP, ACP where available
4. **Create physician portal** for transcript viewing
5. **Build board reporting integration** with major state boards
6. **Implement audit logging** for compliance tracking

### For Long-term
1. **Explore direct partnerships** with major CME providers (AMA, AAFP, ACP)
2. **Implement modern REST API wrapper** around PARS if feasible
3. **Build provider-agnostic CME standard** (similar to learning record store)
4. **Contribute to ACCME Innovation Partners** program
5. **Develop integrations** with state medical board systems

---

## 10. Summary Table

| Provider | Public API | Web Services | OAuth/SSO | Alternative |
|----------|-----------|--------------|-----------|-------------|
| AMA Ed Hub | ❌ No | ❌ No | ⚠️ Limited | LMS partnership, Manual export |
| AAFP | ❌ No | ❌ No | ❌ No | Manual reporting, Manual export |
| ACCME PARS | ✅ Yes | ✅ SOAP/XML | ❌ No | CME Passport portal |
| ACP | ❌ No | ❌ No | ❌ No | Manual export |
| ACS | ❌ No | ❌ No | ❌ No | ACCME integration |

---

## Document Metadata

- **Last Updated**: 2026-02-12
- **Research Scope**: Public API documentation, developer programs, integration patterns
- **Data Sources**: Official provider websites, developer documentation, ACCME resources
- **Status**: Current as of February 2026

## Related Documents

- [CME Tracking App Architecture](./ARCHITECTURE.md) (if created)
- [PARS Integration Implementation Guide](./PARS_IMPLEMENTATION.md) (if created)
- [API Authentication Strategy](./API_AUTH.md) (if created)
