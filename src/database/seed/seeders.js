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
    );
  `);

  // Partners seeder
  await pool.query(`
    INSERT INTO myschema.partners (name, logo, created_at, updated_at, deleted_at)
    VALUES 
    ('Boya Mic', '/images/partners/boya.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Zhiyun Tech', '/images/partners/Zhiyun-tech.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Great Video Maker', '/images/partners/GVM.jpg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Nanlite', '/images/partners/Nanlite.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Realme', '/images/partners/realme.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Emina', '/images/partners/Emina.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Moratelindo', '/images/partners/Moratelindo.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Pandaboo', '/images/partners/Pandaboo.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('SKALA', '/images/partners/SKALA.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Molecool', '/images/partners/Molecool.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('PT Aneka Warna', '/images/partners/PT-Aneka-Warna.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('SIGMA', '/images/partners/SIGMA.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);
  `);

  // Achievements seeder
  await pool.query(`
    INSERT INTO myschema.achievements (logo, name, year, created_at, updated_at, deleted_at)
    VALUES 
    ('/images/achievements/award1.png', 'Best Digital Innovation', '2023', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/achievements/award2.png', 'Technology Excellence Award', '2022', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/achievements/award3.png', 'Community Impact Award', '2023', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/achievements/award4.png', 'Best Tech Community', '2021', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/achievements/award5.png', 'Innovation Leadership Award', '2022', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);
  `);

  // Work Programs seeder
  await pool.query(`
    INSERT INTO myschema.work_programs (image, title, description, created_at, updated_at, deleted_at)
    VALUES 
    ('/images/programs/mentorship.png', 'Tech Mentorship Program', 'Connect experienced developers with beginners for guided learning and growth', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/programs/workshop.png', 'Monthly Tech Workshops', 'Regular hands-on workshops covering various technology topics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/programs/community.png', 'Community Building', 'Building strong tech communities through regular meetups and events', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/programs/research.png', 'Technology Research', 'Conducting research in emerging technologies and sharing findings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/programs/education.png', 'Tech Education Outreach', 'Bringing technology education to underprivileged communities', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);
  `);

  // Latest Activities seeder
  await pool.query(`
    INSERT INTO myschema.latest_activities (image, title, created_at, updated_at, deleted_at)
    VALUES 
    ('/images/activities/workshop1.jpg', 'AI Workshop Series Completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/activities/hackathon1.jpg', 'Annual Hackathon Success', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/activities/meetup1.jpg', 'Tech Community Meetup', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/activities/conference1.jpg', 'Technology Conference 2024', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('/images/activities/training1.jpg', 'Web Development Training', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);
  `);

  // Divisions seeder
  await pool.query(`
    INSERT INTO myschema.divisions (slug, name, image, created_at, updated_at, deleted_at)
    VALUES 
    ('ufo-veteran-jakarta', 'UFO Veteran Jakarta', '/images/Ufo-Logo.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);
  `);

  // Positions seeder
  await pool.query(`
    INSERT INTO myschema.positions (name, created_at, updated_at, deleted_at)
    VALUES 
    ('Staff of Creative Production', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Event Planner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Equipment', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('External Public Relation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Internal Public Relation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Creative Production', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Social Media Admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Recruitment', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Achievement', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Development', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Manager Operational', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Manager Marketing Communication', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Manager Human Resources Development', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Finance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Secretary 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Secretary 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Chief Executive Officer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);
  `);

  // Members seeder
  await pool.query(`
    INSERT INTO myschema.members (division_id, position_id, name, image, angkatan, instagram, linkedin, whatsapp, created_at, updated_at, deleted_at) VALUES 
    (1, 17, 'Yuwsuf Muhammad Amien', '/images/members/Yuwsuf-Muhammad-Amien.png', 'UFO.022.IX.022', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Ananda Divana', '/images/members/Ananda-Divana.png', 'UFO.023.X.001', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Ananda Ryo Bastian Harefa', '/images/members/RYO.png', 'UFO.023.X.002', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Ananda Triaji Pamungkas', '/images/members/AJI.png', 'UFO.023.X.003', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Arvino Qiyamullail Ramli', '/images/members/VINO.png', 'UFO.023.X.004', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Catherine Esther Nauli Siagian', '/images/members/CATHERINE.png', 'UFO.023.X.005', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Danendra Helmy Pratama', '/images/members/DANEN.png', 'UFO.023.X.006', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Fahda Putri', '/images/members/FAHDA.png', 'UFO.023.X.007', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Farhan Hardiansyah', '/images/members/FARHAN.png', 'UFO.023.X.008', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Fikri Suprobo Putra', '/images/members/FIKRI.png', 'UFO.023.X.009', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Meira Zaskya', '/images/members/MEIRA.png', 'UFO.023.X.010', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Muhammad Kevin Rasendriya', '/images/members/KEVIN.png', 'UFO.023.X.011', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Muhammad Rayhan Satria Aji', '/images/members/RAYHAN.png', 'UFO.023.X.013', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Muhammad Rifqi Wiryawan', '/images/members/RIFQI.png', 'UFO.023.X.014', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Nicky Felix Amanusa', '/images/members/NICKY.png', 'UFO.023.X.015', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Nur Farah Afifah', '/images/members/AFIFAH.png', 'UFO.023.X.016', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Nurul Fikriah Saniah', '/images/members/SANIAH.png', 'UFO.023.X.017', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Rafif Firmansyah', '/images/members/RAFIF.png', 'UFO.023.X.018', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Rahma Aprilia', '/images/members/RAHMA.png', 'UFO.023.X.019', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    (1, 17, 'Seno Oktariadi', '/images/members/SENO.png', 'UFO.023.X.020', 'yuwsufamien', 'yuwsufamien', '0812-1234-5678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);
  `);

  // Category Gallery seeder
  await pool.query(`
    INSERT INTO myschema.category_galleries (name, created_at, updated_at, deleted_at)
    VALUES
    ('Fotografi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('Desain Grafis', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);
  `);

  await pool.query(`
    INSERT INTO myschema.galleries (category_galleries_id, slug, title, image, snippet, author, created_at, updated_at, deleted_at)
    VALUES
    ('3', 'lihat-lebih-dalam', 'Lihat Lebih Dalam', '/images/galleries/lihat-lebih-dalam.png', 'Bukan mereka, kaulah Monsternya. Buka matamu, lihat lebih dalam, kesadaran itu menyelamatkanmu.', 'Ananda Triaji Pamungkas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('3', 'sahabat-kecil', 'Sahabat Kecil', '/images/galleries/Giras Agung Jagratara_Sahabat Kecil.JPG', 'Sahabat kecil mempunyai arti yang sangat penting dalam kehidupan kita. Kita tumbuh bersama-sama dengan melewati berbagai fase, saling bertukar cerita dan tentu saja moment itulah yang akan dirindukan ketika kita sama-sama tumbuh dewasa.', 'Giras Agung Jagratara', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('3', 'teman-seperjuangan', 'Teman Seperjuangan', '/images/galleriees/Girad Agung_Teman Seperjuangan - Giras Agung.JPG', 'Mereka sama-sama berjuang untuk mendapatkan kejuaraan, apalagi mereka merupakan teman seperjuangan yang memang dari kecil sudah sama-sama, jadi saling memahami dan menjaga kekompakan.', 'Giras Agung Jagratara', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('3', 'langkah-menuju-puncak', 'Langkah Menuju Puncak', '/images/galleries/Moh. Alfariz_Langkah Menuju Puncak.png', 'Seorang ayah, meskipun terkadang perjuangannya tak disadari, setiap tindakannya dijalani dengan cinta yang mendalam dan tekad yang kuat untuk melihat anak-anaknya tumbuh bahagia dan berhasil mencapai puncak kesuksesan.', 'Moh. Alfariz', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('3', 'hati-hati', 'Hati-Hati', '/images/galleries/Salina dan Ucup_Hati-Hati - sal.jpg', 'Sebelum berbicara, tanyakan pada diri sendiri: Apakah kata-kataku ini membangun, atau malah menghancurkan? Marilah kita jaga lisan kita, sebarkan kebaikan dan saling menguatkan melalui kata-kata yang indah. Jadilah pahlawan kata-kata, gunakan kekuatanmu untuk menyebarkan kedamaian dan cinta di dunia.', 'Salina Siti Hanifa & Yuwsuf Muhammad Amien', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
    ('3', 'unseent-part-1', 'UNSEeN/T Part 1', '/images/galleries/HENOSEP_UNSEeN_T PART 1.jpg', '"""Kaka, Sudah mau pulang kah? Kau sering-sering datang lihat kita di siniee biar kau bisa bantu-bantu kita bersekolah. Kau lihat temanku baju putih, semangat sekali toh hehe"""', 'Herlina Septiani', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);
  `);
};
