const pool = require('../../config/database');

exports.seed = async () => {
  // Users seeder
  await pool.query(`
    INSERT INTO myschema.users (username, password, created_at, updated_at, deleted_at)
    VALUES ('john_doe', 'securepassword123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
  `);

  // Contents seeder
  await pool.query(`
    INSERT INTO myschema.contents (link, created_at, updated_at, deleted_at)
    VALUES 
    ('https://example.com/content1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('https://example.com/content2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('https://example.com/content3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('https://example.com/content4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('https://example.com/content5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
  `);

  // Events seeder
  await pool.query(`
    INSERT INTO myschema.events (
      slug, cover, cover_landscape, name, start_event_date, end_event_date,
      start_event_time, end_event_time, registration_start_date, registration_end_date,
      registration_start_time, registration_end_time, body, snippets, link_registration, location
    )
    VALUES 
    (
      'tech-conference-2024', '/images/tech-conf.jpg', '/images/tech-conf-land.jpg',
      'Tech Conference 2024', '2024-06-01', '2024-06-03', '09:00:00', '17:00:00',
      '2024-05-01', '2024-05-30', '00:00:00', '23:59:59',
      'Join us for the biggest tech conference of the year!',
      'Learn about AI, Cloud, and more', 'https://example.com/register/tech-conf',
      'Jakarta Convention Center'
    ),
    (
      'workshop-ai', '/images/ai-workshop.jpg', '/images/ai-workshop-land.jpg',
      'AI Workshop', '2024-07-15', '2024-07-15', '13:00:00', '16:00:00',
      '2024-06-15', '2024-07-10', '00:00:00', '23:59:59',
      'Hands-on workshop about artificial intelligence',
      'Practice with real AI models', 'https://example.com/register/ai-workshop',
      'Online via Zoom'
    ),
    (
      'hackathon-2024', '/images/hackathon.jpg', '/images/hackathon-land.jpg',
      'Annual Hackathon', '2024-08-20', '2024-08-22', '08:00:00', '20:00:00',
      '2024-07-20', '2024-08-15', '00:00:00', '23:59:59',
      '48-hour coding challenge for innovative solutions',
      'Build, present, win prizes', 'https://example.com/register/hackathon',
      'Innovative Hub Jakarta'
    ),
    (
      'web-dev-bootcamp', '/images/webdev.jpg', '/images/webdev-land.jpg',
      'Web Development Bootcamp', '2024-09-10', '2024-09-12', '09:00:00', '16:00:00',
      '2024-08-10', '2024-09-05', '00:00:00', '23:59:59',
      'Intensive 3-day web development bootcamp',
      'From basics to advanced concepts', 'https://example.com/register/webdev',
      'Digital Campus Jakarta'
    ),
    (
      'tech-startup-summit', '/images/startup.jpg', '/images/startup-land.jpg',
      'Tech Startup Summit', '2024-10-05', '2024-10-06', '10:00:00', '18:00:00',
      '2024-09-05', '2024-10-01', '00:00:00', '23:59:59',
      'Connect with investors and fellow entrepreneurs',
      'Networking and pitching sessions', 'https://example.com/register/summit',
      'Business District Center'
    )
  `);

  // Partners seeder
  await pool.query(`
    INSERT INTO myschema.partners (name, logo, created_at, updated_at, deleted_at)
    VALUES 
    ('Google Indonesia', '/images/partners/google.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Microsoft Indonesia', '/images/partners/microsoft.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('AWS Indonesia', '/images/partners/aws.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Telkom Indonesia', '/images/partners/telkom.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Gojek', '/images/partners/gojek.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
  `);

  // Achievements seeder
  await pool.query(`
    INSERT INTO myschema.achievements (logo, name, year, created_at, updated_at, deleted_at)
    VALUES 
    ('/images/achievements/award1.png', 'Best Digital Innovation', '2023', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/achievements/award2.png', 'Technology Excellence Award', '2022', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/achievements/award3.png', 'Community Impact Award', '2023', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/achievements/award4.png', 'Best Tech Community', '2021', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/achievements/award5.png', 'Innovation Leadership Award', '2022', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
  `);

  // Work Programs seeder
  await pool.query(`
    INSERT INTO myschema.work_programs (image, title, description, created_at, updated_at, deleted_at)
    VALUES 
    ('/images/programs/mentorship.png', 'Tech Mentorship Program', 'Connect experienced developers with beginners for guided learning and growth', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/programs/workshop.png', 'Monthly Tech Workshops', 'Regular hands-on workshops covering various technology topics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/programs/community.png', 'Community Building', 'Building strong tech communities through regular meetups and events', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/programs/research.png', 'Technology Research', 'Conducting research in emerging technologies and sharing findings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/programs/education.png', 'Tech Education Outreach', 'Bringing technology education to underprivileged communities', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
  `);

  // Latest Activities seeder
  await pool.query(`
    INSERT INTO myschema.latest_activities (image, title, created_at, updated_at, deleted_at)
    VALUES 
    ('/images/activities/workshop1.jpg', 'AI Workshop Series Completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/activities/hackathon1.jpg', 'Annual Hackathon Success', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/activities/meetup1.jpg', 'Tech Community Meetup', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/activities/conference1.jpg', 'Technology Conference 2024', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/activities/training1.jpg', 'Web Development Training', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
  `);

  // Divisions seeder
  await pool.query(`
    INSERT INTO myschema.divisions (slug, name, image, created_at, updated_at, deleted_at)
    VALUES 
    ('software-development', 'Software Development', '/images/divisions/software.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('data-science', 'Data Science', '/images/divisions/data.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('cybersecurity', 'Cybersecurity', '/images/divisions/security.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('ui-ux', 'UI/UX Design', '/images/divisions/design.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('cloud-computing', 'Cloud Computing', '/images/divisions/cloud.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
  `);

  // Positions seeder
  await pool.query(`
    INSERT INTO myschema.positions (name, created_at, updated_at, deleted_at)
    VALUES 
    ('Software Engineer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Data Scientist', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Security Analyst', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('UI/UX Designer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Cloud Architect', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
  `);
};
