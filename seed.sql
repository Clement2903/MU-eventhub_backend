-- Only insert demonstration proposals into a fresh empty table.
INSERT INTO records (title, category, description, status)
SELECT title, category, description, status FROM (VALUES
('Campus Coding Workshop','Academic','A beginner-friendly workshop on JavaScript and web development.','Pending'),
('Interfaculty Football Tournament','Sport','Teams from different schools compete in a friendly football tournament.','In progress'),
('Traditional Dance Evening','Culture','Students present dances and music representing different cultures.','Completed'),
('Career Networking Afternoon','Academic','Invite local professionals to speak about internships and careers.','Pending'),
('Campus Basketball Challenge','Sport','An afternoon basketball event for mixed student teams.','In progress'),
('Student Poetry Showcase','Culture','An open microphone event for original poetry and spoken word.','Pending'),
('Environmental Awareness Day','Community','Students clean common areas and discuss ways to reduce waste.','Completed'),
('Entrepreneurship Ideas Fair','Academic','Student teams present small business ideas and receive feedback.','Pending')
) AS demos(title, category, description, status)
WHERE NOT EXISTS (SELECT 1 FROM records);
