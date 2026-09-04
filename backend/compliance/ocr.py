from abc import ABC, abstractmethod
from typing import Dict, Any

class OCRServiceInterface(ABC):
    """
    Pluggable OCR service interface for scanning licenses, certifications, and timesheets.
    """
    @abstractmethod
    def extract_document_data(self, file_path_or_buffer) -> Dict[str, Any]:
        pass

class MockOCRService(OCRServiceInterface):
    """
    Local mock OCR parser simulating extraction of license numbers and expiration dates.
    """
    def extract_document_data(self, file_path_or_buffer) -> Dict[str, Any]:
        return {
            'detected_type': 'Registered Nurse Practicing License',
            'issuer': 'State Board of Nursing / NMC',
            'license_number': 'RN-2024-88491',
            'extracted_expiry': '2027-12-31',
            'confidence_score': 0.96,
            'status': 'success'
        }
