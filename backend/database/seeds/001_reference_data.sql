SET NAMES utf8mb4;

INSERT IGNORE INTO roles (code, label, description) VALUES
  ('APPLICANT', 'Applicant', 'Creates and tracks admission applications'),
  ('ADMISSION_OFFICER', 'Admission Officer', 'Verifies applicant documents and manages screening tasks'),
  ('EVALUATOR', 'Evaluator', 'Reviews assigned applications and submits department assessments'),
  ('ADMIN', 'Admin', 'Manages institutional configuration and final admission decisions');

INSERT IGNORE INTO application_stages (code, label, sequence_no, description) VALUES
  ('APPLICATION_SUBMISSION', 'Application Submission', 1, 'Applicant creates and submits an application'),
  ('DOCUMENT_VERIFICATION', 'Document Verification', 2, 'Admission Officer verifies required documents'),
  ('ELIGIBILITY_SCREENING', 'Eligibility Screening', 3, 'Application is checked against programme eligibility rules'),
  ('DEPARTMENT_REVIEW', 'Department Review', 4, 'Assigned Evaluator completes the academic assessment'),
  ('FINAL_ADMISSION_DECISION', 'Final Admission Decision', 5, 'Admin records the final admission outcome');

INSERT IGNORE INTO document_types (code, name, description) VALUES
  ('MARKS_10', '10th Standard Marks Card', 'Secondary school marks card'),
  ('MARKS_12_PUC', '12th / PUC Marks Card', 'Higher secondary or PUC marks card'),
  ('LEAVING_CERTIFICATE', 'Leaving Certificate', 'School or college leaving certificate'),
  ('DEGREE_CERTIFICATE', 'Degree Certificate', 'Degree certificate where applicable'),
  ('HOSTEL_APPLICATION', 'Hostel Application', 'Optional hostel application document'),
  ('MESS_APPLICATION', 'Mess Application', 'Optional mess application document'),
  ('MIGRATION_CERTIFICATE', 'Migration Certificate', 'Additional supporting document where applicable'),
  ('TRANSFER_CERTIFICATE', 'Transfer Certificate', 'Additional supporting document where applicable'),
  ('OTHER_SUPPORTING_DOCUMENT', 'Other Supporting Document', 'Other supporting document requested by the institution');

-- Development starter cycle. Confirm/adjust dates with the institution before deployment.
INSERT INTO admission_cycles (name, start_date, end_date, is_active)
SELECT '2026-27 Admission Cycle (configure dates)', '2026-04-01', '2027-03-31', 1
WHERE NOT EXISTS (SELECT 1 FROM admission_cycles WHERE is_active = 1);

-- Catalogue below is seeded from the illustrative CrediFit frontend catalogue.
INSERT IGNORE INTO programmes (code, name, short_code, category, level, duration, description, is_active) VALUES
  ('CSE', 'Computer Science Engineering', 'CSE', 'Engineering & Technology', 'Undergraduate', '4 years', 'Programming, algorithms, software engineering and computing systems.', 1),
  ('BCA', 'Bachelor of Computer Applications', 'BCA', 'Engineering & Technology', 'Undergraduate', '3 years', 'Programming, databases, software development and modern computing.', 1),
  ('AI/ML', 'Artificial Intelligence & Machine Learning', 'AI/ML', 'Engineering & Technology', 'Undergraduate', '4 years', 'Machine learning, intelligent systems and applied AI.', 1),
  ('ISE', 'Information Science', 'ISE', 'Engineering & Technology', 'Undergraduate', '4 years', 'Information systems, databases, networking and software development.', 1),
  ('ME', 'Mechanical Engineering', 'ME', 'Engineering & Technology', 'Undergraduate', '4 years', 'Mechanical systems, manufacturing and engineering design.', 1),
  ('CE', 'Civil Engineering', 'CE', 'Engineering & Technology', 'Undergraduate', '4 years', 'Infrastructure, construction, structures and transportation.', 1),
  ('ECE', 'Electronics & Communication Engineering', 'ECE', 'Engineering & Technology', 'Undergraduate', '4 years', 'Electronics, communication systems and embedded technology.', 1),
  ('MCA', 'Master of Computer Applications', 'MCA', 'Engineering & Technology', 'Postgraduate', '2 years', 'Advanced computing, software applications and development.', 1),
  ('DIP-ENG', 'Polytechnic Diploma in Engineering', 'DIP-ENG', 'Engineering & Technology', 'Diploma', 'Typically 3 years', 'Practical and technical foundations in an engineering discipline.', 1),
  ('MBBS', 'Bachelor of Medicine and Bachelor of Surgery', 'MBBS', 'Medical & Healthcare', 'Undergraduate', 'As prescribed', 'Medical education and clinical training for future doctors.', 1),
  ('BDS', 'Bachelor of Dental Surgery', 'BDS', 'Medical & Healthcare', 'Undergraduate', 'As prescribed', 'Dental sciences, oral health and clinical practice.', 1),
  ('B.Sc Nursing', 'Bachelor of Science in Nursing', 'B.Sc Nursing', 'Medical & Healthcare', 'Undergraduate', 'Typically 4 years', 'Patient care, clinical practice and nursing sciences.', 1),
  ('B.Pharm', 'Bachelor of Pharmacy', 'B.Pharm', 'Medical & Healthcare', 'Undergraduate', 'Typically 4 years', 'Pharmaceutical sciences, medicines and drug safety.', 1),
  ('BPT', 'Bachelor of Physiotherapy', 'BPT', 'Medical & Healthcare', 'Undergraduate', 'As prescribed', 'Movement, rehabilitation and physical therapy.', 1),
  ('MLT', 'Medical Laboratory Technology', 'MLT', 'Medical & Healthcare', 'Undergraduate', 'Varies by programme', 'Laboratory testing and diagnostic healthcare techniques.', 1),
  ('MPH', 'Master of Public Health', 'MPH', 'Medical & Healthcare', 'Postgraduate', 'Varies by programme', 'Public health, epidemiology and population-level healthcare.', 1),
  ('B.Sc Agri', 'Bachelor of Science in Agriculture', 'B.Sc Agri', 'Agriculture & Veterinary', 'Undergraduate', 'Typically 4 years', 'Crop science, soil management and agricultural systems.', 1),
  ('B.Sc Hort', 'Horticulture', 'B.Sc Hort', 'Agriculture & Veterinary', 'Undergraduate', 'Typically 4 years', 'Fruits, vegetables, plantation crops and plant production.', 1),
  ('BVSc', 'Veterinary Science', 'BVSc', 'Agriculture & Veterinary', 'Undergraduate', 'As prescribed', 'Animal health, veterinary medicine and animal husbandry.', 1),
  ('B.Sc Forestry', 'Forestry', 'B.Sc Forestry', 'Agriculture & Veterinary', 'Undergraduate', 'Typically 4 years', 'Forest ecosystems, conservation and natural resource management.', 1),
  ('BFSc', 'Fisheries Science', 'BFSc', 'Agriculture & Veterinary', 'Undergraduate', 'Varies by programme', 'Aquaculture, aquatic ecosystems and fisheries management.', 1),
  ('B.Sc Physics', 'Physics', 'B.Sc Physics', 'Science & Research', 'Undergraduate', 'Typically 3–4 years', 'Matter, energy, experimental science and physical systems.', 1),
  ('B.Sc Chemistry', 'Chemistry', 'B.Sc Chemistry', 'Science & Research', 'Undergraduate', 'Typically 3–4 years', 'Chemical principles, laboratory methods and material properties.', 1),
  ('B.Sc Maths', 'Mathematics', 'B.Sc Maths', 'Science & Research', 'Undergraduate', 'Typically 3–4 years', 'Mathematical modelling, statistics and analytical methods.', 1),
  ('B.Sc Biotech', 'Biotechnology', 'B.Sc Biotech', 'Science & Research', 'Undergraduate', 'Varies by programme', 'Biological systems, biotechnology and laboratory research.', 1),
  ('B.Sc Micro', 'Microbiology', 'B.Sc Micro', 'Science & Research', 'Undergraduate', 'Varies by programme', 'Microorganisms, laboratory science and applied biology.', 1),
  ('Env. Sci', 'Environmental Science', 'Env. Sci', 'Science & Research', 'Undergraduate', 'Varies by programme', 'Environmental systems, sustainability and conservation.', 1),
  ('BBA', 'Bachelor of Business Administration', 'BBA', 'Business & Commerce', 'Undergraduate', 'Typically 3–4 years', 'Management, operations, leadership and business strategy.', 1),
  ('B.Com', 'Bachelor of Commerce', 'B.Com', 'Business & Commerce', 'Undergraduate', 'Typically 3–4 years', 'Accounting, taxation, business and commercial principles.', 1),
  ('MBA', 'Master of Business Administration', 'MBA', 'Business & Commerce', 'Postgraduate', 'Typically 2 years', 'Business leadership, strategy, finance and management.', 1),
  ('M.Com', 'Master of Commerce', 'M.Com', 'Business & Commerce', 'Postgraduate', 'Typically 2 years', 'Advanced commerce, accounting and financial management.', 1),
  ('B.A. Econ', 'Economics', 'B.A. Econ', 'Business & Commerce', 'Undergraduate', 'Typically 3–4 years', 'Markets, economic policy, data and resource allocation.', 1),
  ('BA', 'Bachelor of Arts', 'BA', 'Arts & Social Sciences', 'Undergraduate', 'Typically 3–4 years', 'Humanities and social science subjects across multiple disciplines.', 1),
  ('B.Sc Psych', 'Psychology', 'B.Sc Psych', 'Arts & Social Sciences', 'Undergraduate', 'Varies by programme', 'Human behaviour, cognition and psychological research.', 1),
  ('B.A. Soc', 'Sociology', 'B.A. Soc', 'Arts & Social Sciences', 'Undergraduate', 'Typically 3–4 years', 'Society, communities, institutions and social change.', 1),
  ('JMC', 'Journalism & Mass Communication', 'JMC', 'Arts & Social Sciences', 'Undergraduate', 'Varies by programme', 'Reporting, digital media, communication and storytelling.', 1),
  ('LLB', 'Bachelor of Laws', 'LLB', 'Law & Public Policy', 'Undergraduate', 'Depends on entry route', 'Legal principles, advocacy and the justice system.', 1),
  ('BA LLB', 'Integrated BA LLB', 'BA LLB', 'Law & Public Policy', 'Undergraduate', 'Typically 5 years', 'Combined undergraduate arts and professional legal studies.', 1),
  ('LLM', 'Master of Laws', 'LLM', 'Law & Public Policy', 'Postgraduate', 'Varies by programme', 'Advanced legal study and specialised legal research.', 1),
  ('B.A. Pol Sci', 'Political Science', 'B.A. Pol Sci', 'Law & Public Policy', 'Undergraduate', 'Typically 3–4 years', 'Government, public policy, political institutions and governance.', 1),
  ('B.Arch', 'Bachelor of Architecture', 'B.Arch', 'Architecture & Design', 'Undergraduate', 'Typically 5 years', 'Architectural design, buildings and the built environment.', 1),
  ('Interior', 'Interior Design', 'Interior', 'Architecture & Design', 'Undergraduate', 'Varies by programme', 'Interior spaces, materials, planning and design practice.', 1),
  ('Fashion', 'Fashion Design', 'Fashion', 'Architecture & Design', 'Undergraduate', 'Varies by programme', 'Fashion concepts, textiles, garment design and production.', 1),
  ('BFA', 'Fine Arts', 'BFA', 'Architecture & Design', 'Undergraduate', 'Varies by programme', 'Visual arts, creative practice and artistic expression.', 1),
  ('B.Ed', 'Bachelor of Education', 'B.Ed', 'Education & Hospitality', 'Undergraduate', 'As prescribed', 'Teaching methods, pedagogy and classroom practice.', 1),
  ('M.Ed', 'Master of Education', 'M.Ed', 'Education & Hospitality', 'Postgraduate', 'Typically 2 years', 'Advanced pedagogy, educational research and leadership.', 1),
  ('BHM', 'Hotel Management', 'BHM', 'Education & Hospitality', 'Undergraduate', 'Varies by programme', 'Hospitality operations, guest services and hotel management.', 1),
  ('Tourism', 'Tourism Management', 'Tourism', 'Education & Hospitality', 'Undergraduate', 'Varies by programme', 'Tourism operations, travel services and destination management.', 1),
  ('Sports Sci', 'Physical Education & Sports Science', 'Sports Sci', 'Sports & Other Fields', 'Undergraduate', 'Varies by programme', 'Sports performance, exercise science and physical education.', 1),
  ('Aviation', 'Aviation Management', 'Aviation', 'Sports & Other Fields', 'Undergraduate', 'Varies by programme', 'Aviation operations, airport services and management.', 1),
  ('Data Cert', 'Certificate in Data Analytics', 'Data Cert', 'Sports & Other Fields', 'Certificate', 'Varies by provider', 'An introductory pathway into data analysis and visualisation.', 1);

-- Common mandatory document set from the CrediFit requirements. Degree certificate is added for postgraduate programmes; adjust per admission policy.
INSERT IGNORE INTO programme_document_requirements (programme_id, document_type_id, qualification, is_mandatory, is_active, display_order)
SELECT p.id, dt.id, '*', 1, 1, seq.display_order
FROM programmes p
JOIN (SELECT '10th Standard Marks Card' AS name, 1 AS display_order UNION ALL SELECT '12th / PUC Marks Card', 2 UNION ALL SELECT 'Leaving Certificate', 3) seq
JOIN document_types dt ON dt.name = seq.name;
INSERT IGNORE INTO programme_document_requirements (programme_id, document_type_id, qualification, is_mandatory, is_active, display_order)
SELECT p.id, dt.id, '*', 1, 1, 4 FROM programmes p JOIN document_types dt ON dt.name = 'Degree Certificate' WHERE p.level = 'Postgraduate';
