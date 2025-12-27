const dummyProjects = [
  {
    id: 1,
    title: "Digital Learning Lab Setup",
    summary: "Establishing computer labs with internet access in rural schools to bridge the digital divide and provide quality digital education.",
    category: "digital-learning",
    targetAmount: 800000,
    collectedAmount: 520000,
    deadline: "2024-12-31",
    images: [
      "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["digital-education", "computer-lab", "rural-schools", "technology"],
    beneficiaries: 500,
    organization: "EduSync Foundation",
    location: "Rural Maharashtra"
  },
  {
    id: 2,
    title: "Merit Scholarship Program",
    summary: "Providing full scholarships to academically brilliant students from economically disadvantaged backgrounds for higher education.",
    category: "scholarship",
    targetAmount: 1200000,
    collectedAmount: 750000,
    deadline: "2024-11-15",
    images: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["scholarship", "merit-based", "higher-education", "financial-aid"],
    beneficiaries: 100,
    organization: "EduSync Foundation",
    location: "Multiple States"
  },
  {
    id: 3,
    title: "Career Mentorship Program",
    summary: "Connecting students with industry professionals for career guidance, skill development, and internship opportunities.",
    category: "mentorship",
    targetAmount: 450000,
    collectedAmount: 280000,
    deadline: "2024-10-20",
    images: [
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["mentorship", "career-guidance", "professional-development", "internships"],
    beneficiaries: 300,
    organization: "EduSync Foundation",
    location: "Urban Centers"
  },
  {
    id: 4,
    title: "Coding & AI Skills Bootcamp",
    summary: "Intensive training programs in coding, artificial intelligence, and digital skills for underprivileged youth.",
    category: "skill-development",
    targetAmount: 600000,
    collectedAmount: 420000,
    deadline: "2024-09-30",
    images: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["coding", "artificial-intelligence", "tech-skills", "bootcamp"],
    beneficiaries: 200,
    organization: "EduSync Foundation",
    location: "Bangalore, Hyderabad"
  },
  {
    id: 5,
    title: "School Infrastructure Upgrade",
    summary: "Renovating and upgrading classrooms, libraries, and sanitation facilities in government schools.",
    category: "school-infrastructure",
    targetAmount: 950000,
    collectedAmount: 580000,
    deadline: "2024-08-25",
    images: [
      "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1564059813745-7f1f933c6c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["infrastructure", "classroom-renovation", "sanitation", "learning-environment"],
    beneficiaries: 800,
    organization: "EduSync Foundation",
    location: "Rural Uttar Pradesh"
  },
  {
    id: 6,
    title: "Girl Child Education Initiative",
    summary: "Special program to support girls' education through scholarships, mentorship, and safe learning environments.",
    category: "girl-education",
    targetAmount: 550000,
    collectedAmount: 320000,
    deadline: "2024-12-15",
    images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["girl-education", "women-empowerment", "gender-equality", "scholarship"],
    beneficiaries: 250,
    organization: "EduSync Foundation",
    location: "Rajasthan, Bihar"
  },
  {
    id: 7,
    title: "STEM Education Program",
    summary: "Promoting Science, Technology, Engineering, and Mathematics education through hands-on learning and experiments.",
    category: "digital-learning",
    targetAmount: 480000,
    collectedAmount: 295000,
    deadline: "2024-11-30",
    images: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["STEM", "science", "technology", "hands-on-learning"],
    beneficiaries: 400,
    organization: "EduSync Foundation",
    location: "Multiple Locations"
  },
  {
    id: 8,
    title: "English Language Proficiency",
    summary: "Comprehensive English language training program to enhance communication skills and career opportunities.",
    category: "skill-development",
    targetAmount: 320000,
    collectedAmount: 185000,
    deadline: "2024-10-15",
    images: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["english", "language-skills", "communication", "career-development"],
    beneficiaries: 350,
    organization: "EduSync Foundation",
    location: "Tamil Nadu, Kerala"
  },
  {
    id: 9,
    title: "Digital Library Access",
    summary: "Providing tablets and digital library subscriptions to students in remote areas with limited book access.",
    category: "digital-learning",
    targetAmount: 380000,
    collectedAmount: 245000,
    deadline: "2024-12-20",
    images: [
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["digital-library", "e-books", "tablets", "remote-learning"],
    beneficiaries: 600,
    organization: "EduSync Foundation",
    location: "North Eastern States"
  },
  {
    id: 10,
    title: "Vocational Training Center",
    summary: "Establishing vocational training centers for practical skills in electronics, plumbing, and electrical work.",
    category: "skill-development",
    targetAmount: 750000,
    collectedAmount: 420000,
    deadline: "2024-09-25",
    images: [
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["vocational-training", "practical-skills", "employment", "technical-education"],
    beneficiaries: 300,
    organization: "EduSync Foundation",
    location: "Gujarat"
  },
  {
    id: 11,
    title: "Special Needs Education Support",
    summary: "Creating inclusive learning environments and specialized support for students with disabilities.",
    category: "school-infrastructure",
    targetAmount: 420000,
    collectedAmount: 265000,
    deadline: "2024-12-31",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["special-needs", "inclusive-education", "disability-support", "accessibility"],
    beneficiaries: 150,
    organization: "EduSync Foundation",
    location: "Karnataka"
  },
  {
    id: 12,
    title: "Online Learning Platform",
    summary: "Developing and deploying a comprehensive online learning platform with interactive courses and live classes.",
    category: "digital-learning",
    targetAmount: 680000,
    collectedAmount: 410000,
    deadline: "2024-11-10",
    images: [
      "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["online-learning", "e-learning", "digital-platform", "remote-education"],
    beneficiaries: 2000,
    organization: "EduSync Foundation",
    location: "Pan-India"
  },
  {
    id: 13,
    title: "Teacher Training Program",
    summary: "Professional development and modern teaching methodology training for government school teachers.",
    category: "skill-development",
    targetAmount: 350000,
    collectedAmount: 195000,
    deadline: "2024-10-30",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["teacher-training", "professional-development", "education-quality", "capacity-building"],
    beneficiaries: 250,
    organization: "EduSync Foundation",
    location: "Multiple States"
  },
  {
    id: 14,
    title: "Sports & Education Integration",
    summary: "Integrating sports activities with academic learning to promote holistic development of students.",
    category: "school-infrastructure",
    targetAmount: 280000,
    collectedAmount: 165000,
    deadline: "2024-11-20",
    images: [
      "https://images.unsplash.com/photo-1549060279-7e168fce7090?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["sports", "holistic-education", "physical-education", "student-development"],
    beneficiaries: 500,
    organization: "EduSync Foundation",
    location: "Maharashtra"
  },
  {
    id: 15,
    title: "Rural Science Labs",
    summary: "Setting up basic science laboratories in rural schools to facilitate practical learning and experiments.",
    category: "school-infrastructure",
    targetAmount: 520000,
    collectedAmount: 315000,
    deadline: "2024-12-10",
    images: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["science-labs", "practical-learning", "rural-education", "experiments"],
    beneficiaries: 600,
    organization: "EduSync Foundation",
    location: "Madhya Pradesh"
  },
  {
    id: 16,
    title: "Digital Literacy for Parents",
    summary: "Training parents in digital skills to help them support their children's online education journey.",
    category: "digital-learning",
    targetAmount: 220000,
    collectedAmount: 125000,
    deadline: "2024-09-15",
    images: [
      "https://images.unsplash.com/photo-1584697964358-3e14ca57658b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["digital-literacy", "parent-training", "family-support", "community-education"],
    beneficiaries: 400,
    organization: "EduSync Foundation",
    location: "Urban Slums"
  },
  {
    id: 17,
    title: "Mobile Library Van",
    summary: "Operating mobile library vans to reach remote villages and promote reading culture among children.",
    category: "school-infrastructure",
    targetAmount: 320000,
    collectedAmount: 185000,
    deadline: "2024-10-25",
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["mobile-library", "reading-culture", "remote-areas", "book-access"],
    beneficiaries: 800,
    organization: "EduSync Foundation",
    location: "Himalayan Region"
  },
  {
    id: 18,
    title: "Entrepreneurship Education",
    summary: "Teaching entrepreneurship skills and business fundamentals to college and university students.",
    category: "skill-development",
    targetAmount: 380000,
    collectedAmount: 220000,
    deadline: "2024-11-05",
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["entrepreneurship", "business-skills", "startup", "innovation"],
    beneficiaries: 200,
    organization: "EduSync Foundation",
    location: "Metro Cities"
  },
  {
    id: 19,
    title: "Girls in Tech Program",
    summary: "Encouraging and supporting girls to pursue careers in technology through specialized training and mentorship.",
    category: "girl-education",
    targetAmount: 450000,
    collectedAmount: 275000,
    deadline: "2024-12-28",
    images: [
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["girls-in-tech", "women-in-stem", "technology", "gender-diversity"],
    beneficiaries: 150,
    organization: "EduSync Foundation",
    location: "Multiple Locations"
  },
  {
    id: 20,
    title: "After-School Tutoring Program",
    summary: "Providing free after-school tutoring and academic support to students struggling with their studies.",
    category: "mentorship",
    targetAmount: 290000,
    collectedAmount: 165000,
    deadline: "2024-11-25",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
    ],
    tags: ["tutoring", "academic-support", "after-school", "remedial-education"],
    beneficiaries: 350,
    organization: "EduSync Foundation",
    location: "Urban Poor Communities"
  }
];

import image1 from './p 1.avif';
import image2 from './image 2.jpg';
import image3 from './image 3.avif';
import image4 from './image 4.jpg'


export  {
  image1,
  image2,
  image3,
  image4
};