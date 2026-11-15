export interface FmiCurriculum {
  [specialization: string]: {
    [year: number]: {
      [semester: number]: string[];
    };
  };
}

export const UBB_FMI_SPECIALIZATIONS = [
  'Informatică (Română)',
  'Informatică (Engleză)',
  'Informatică (Maghiară)',
  'Informatică (Germană)',
  'Inteligență Artificială (Engleză)',
  'Ingineria Informației (Engleză)',
  'Ingineria Informației (Maghiară)',
  'Matematică Informatică (Română)',
  'Matematică Informatică (Engleză)',
  'Matematică Informatică (Maghiară)',
  'Matematică-Informatică dublă specializare (Română)',
  'Matematică-Informatică dublă specializare (Engleză)',
  'Matematică-Informatică dublă specializare (Maghiară)',
  'Matematică (Română)',
  'Matematică (Maghiară)',
] as const;

export const FOUR_YEAR_SPECIALIZATIONS = new Set<string>([
  'Ingineria Informației (Engleză)',
  'Ingineria Informației (Maghiară)',
  'Matematică-Informatică dublă specializare (Română)',
  'Matematică-Informatică dublă specializare (Engleză)',
  'Matematică-Informatică dublă specializare (Maghiară)',
]);

export const UBB_FMI_YEARS = [1, 2, 3, 4] as const;
export const UBB_FMI_SEMESTERS = [1, 2] as const;

export function getYearsForSpecialization(specialization?: string): number[] {
  if (!specialization) return [1, 2, 3, 4];
  return FOUR_YEAR_SPECIALIZATIONS.has(specialization) ? [1, 2, 3, 4] : [1, 2, 3];
}

const INFO_RO_CURRICULUM = {
  1: {
    1: [
      'Fundamentele Programării',
      'Algoritmică și Grafuri',
      'Arhitectura Sistemelor de Calcul',
      'Algebră',
      'Analiză Matematică',
      'Logică Computațională',
    ],
    2: [
      'Programare Orientată Obiect',
      'Structuri de Date și Algoritmi',
      'Sisteme de Operare',
      'Geometrie',
      'Sisteme Dinamice',
    ],
  },
  2: {
    1: [
      'Metode Avansate de Programare',
      'Baze de Date',
      'Rețele de Calculatoare',
      'Probabilități și Statistică',
      'Programare Logică și Funcțională',
    ],
    2: [
      'Ingineria Sistemelor Soft',
      'Sisteme de Gestiune a Bazelor de Date',
      'Programare Web',
      'Inteligență Artificială',
      'Medii de Proiectare și Programare',
    ],
  },
  3: {
    1: [
      'Limbaje Formale și Tehnici de Compilare',
      'Programare Paralelă și Distribuită',
      'Programare pentru Dispozitive Mobile',
      'Securitate Software',
      'Proiect Colectiv',
    ],
    2: [
      'Calcul Numeric',
      'Validarea și Verificarea Sistemelor Soft',
      'Elaborarea Lucrării de Licență',
    ],
  },
};

const INFO_EN_CURRICULUM = {
  1: {
    1: [
      'Fundamentals of Programming',
      'Graph Algorithms',
      'Computer Systems Architecture',
      'Algebra',
      'Mathematical Analysis',
      'Computational Logic',
    ],
    2: [
      'Object Oriented Programming',
      'Data Structures and Algorithms',
      'Operating Systems',
      'Geometry',
      'Dynamical Systems',
    ],
  },
  2: {
    1: [
      'Advanced Programming Methods',
      'Databases',
      'Computer Networks',
      'Probability and Statistics',
      'Functional and Logic Programming',
    ],
    2: [
      'Software Engineering',
      'Database Management Systems',
      'Web Programming',
      'Artificial Intelligence',
      'Systems for Design and Implementation',
    ],
  },
  3: {
    1: [
      'Formal Languages and Compiler Design',
      'Parallel and Distributed Programming',
      'Mobile Application Programming',
      'Software Security',
      'Team Project',
    ],
    2: [
      'Numerical Calculus',
      'Software Systems Verification and Validation',
      'Bachelor Thesis Preparation',
    ],
  },
};

const INFO_HU_CURRICULUM = {
  1: {
    1: [
      'Programozás alapjai (Fundamentele Programării)',
      'Gráfelmélet és algoritmusok (Algoritmică și Grafuri)',
      'Számítógép-architektúrák (Arhitectura Sistemelor de Calcul)',
      'Algebra (Algebră)',
      'Matematikai analízis (Analiză Matematică)',
      'Számítástudományi logika (Logică Computațională)',
    ],
    2: [
      'Objektumorientált programozás (POO)',
      'Adatszerkezetek és algoritmusok (SDA)',
      'Operációs rendszerek (Sisteme de Operare)',
      'Geometria (Geometrie)',
      'Dinamikus rendszerek (Sisteme Dinamice)',
    ],
  },
  2: {
    1: [
      'Haladó programozási módszerek (MAP)',
      'Adatbázisok (Baze de Date)',
      'Számítógép-hálózatok (Rețele de Calculatoare)',
      'Valószínűségszámítás és statisztika',
      'Logikai és funkcionális programozás (PLF)',
    ],
    2: [
      'Szoftverrendszerek tervezése (ISS)',
      'Adatbázis-kezelő rendszerek (SGBD)',
      'Webprogramozás (Programare Web)',
      'Mesterséges intelligencia (Inteligență Artificială)',
      'Tervezési és programozási környezetek (MPP)',
    ],
  },
  3: {
    1: [
      'Formális nyelvek és fordítóprogramok (LFTC)',
      'Párhuzamos és elosztott programozás (PPD)',
      'Mobilalkalmazás-fejlesztés',
      'Csoportprojekt (Proiect Colectiv)',
    ],
    2: [
      'Numerikus számítások (Calcul Numeric)',
      'Szoftverrendszerek ellenőrzése és validálása',
      'Államvizsga-dolgozat készítése',
    ],
  },
};

const INFO_DE_CURRICULUM = {
  1: {
    1: [
      'Grundlagen der Programmierung (Fundamentele Programării)',
      'Graphenalgorithmen (Algoritmică și Grafuri)',
      'Rechnerarchitektur (Arhitectura Sistemelor de Calcul)',
      'Algebra (Algebră)',
      'Mathematische Analysis (Analiză Matematică)',
      'Computerlogik (Logică Computațională)',
    ],
    2: [
      'Objektorientierte Programmierung (POO)',
      'Datenstrukturen und Algorithmen (SDA)',
      'Betriebssysteme (Sisteme de Operare)',
      'Geometrie (Geometrie)',
      'Dynamische Systeme (Sisteme Dinamice)',
    ],
  },
  2: {
    1: [
      'Fortgeschrittene Programmiermethoden (MAP)',
      'Datenbanken (Baze de Date)',
      'Rechnernetze (Rețele de Calculatoare)',
      'Wahrscheinlichkeitsrechnung und Statistik',
      'Logische und funktionale Programmierung (PLF)',
    ],
    2: [
      'Software Engineering (ISS)',
      'Datenbankmanagementsysteme (SGBD)',
      'Webprogrammierung (Programare Web)',
      'Künstliche Intelligenz (Inteligență Artificială)',
      'Entwurfs- und Programmierumgebungen (MPP)',
    ],
  },
  3: {
    1: [
      'Formale Sprachen und Compilerbau (LFTC)',
      'Parallele und verteilte Programmierung (PPD)',
      'Mobile Programmierung',
      'Teamprojekt (Proiect Colectiv)',
    ],
    2: [
      'Numerische Mathematik (Calcul Numeric)',
      'Verifikation und Validierung von Softwaresystemen',
      'Bachelorarbeit (Elaborarea Lucrării de Licență)',
    ],
  },
};

const MATE_INFO_3Y_RO = {
  1: {
    1: [
      'Fundamentele Programării',
      'Algebră Liniară',
      'Analiză Matematică I (Calcul Diferențial)',
      'Geometrie Analitică',
      'Arhitectura Sistemelor de Calcul',
    ],
    2: [
      'Programare Orientată Obiect',
      'Structuri de Date și Algoritmi',
      'Analiză Matematică II (Calcul Integral)',
      'Structuri Algebrice',
      'Sisteme de Operare',
    ],
  },
  2: {
    1: [
      'Metode Avansate de Programare',
      'Baze de Date',
      'Ecuații Diferențiale',
      'Analiză Complexă',
      'Teoria Probabilităților',
    ],
    2: [
      'Programare Web',
      'Inteligență Artificială',
      'Statistică Matematică',
      'Calcul Numeric',
      'Geometrie Diferențială',
    ],
  },
  3: {
    1: [
      'Ingineria Sistemelor Soft',
      'Rețele de Calculatoare',
      'Cercetări Operaționale',
      'Ecuații cu Derivate Parțiale',
    ],
    2: [
      'Grafică pe Calculator',
      'Astronomie',
      'Elaborarea Lucrării de Licență',
    ],
  },
};

const MATE_INFO_4Y_RO = {
  ...MATE_INFO_3Y_RO,
  4: {
    1: [
      'Analiză Funcțională',
      'Programare Paralelă și Distribuită',
      'Topologie',
      'Analiză Numerică Avansată',
    ],
    2: [
      'Teoria Numerelor și Criptografie',
      'Validarea și Verificarea Sistemelor Soft',
      'Elaborarea Lucrării de Licență (Dublă Specializare)',
    ],
  },
};

export const UBB_FMI_CURRICULUM: FmiCurriculum = {
  'Informatică (Română)': INFO_RO_CURRICULUM,
  'Informatică (Engleză)': INFO_EN_CURRICULUM,
  'Informatică (Maghiară)': INFO_HU_CURRICULUM,
  'Informatică (Germană)': INFO_DE_CURRICULUM,
  'Inteligență Artificială (Engleză)': {
    1: {
      1: [
        'Fundamentals of Programming',
        'Linear Algebra',
        'Calculus',
        'Computational Logic',
        'Computer Systems Architecture',
      ],
      2: [
        'Object Oriented Programming',
        'Data Structures and Algorithms',
        'Probability and Statistics',
        'Operating Systems',
        'Discrete Mathematics',
      ],
    },
    2: {
      1: [
        'Machine Learning',
        'Databases',
        'Advanced Programming Methods',
        'Optimization Techniques',
        'Functional and Logic Programming',
      ],
      2: [
        'Deep Learning',
        'Natural Language Processing',
        'Knowledge Representation and Reasoning',
        'Computer Vision',
        'Software Engineering',
      ],
    },
    3: {
      1: [
        'Reinforcement Learning',
        'Multi-Agent Systems',
        'Ethics and Explainability in AI',
        'Big Data Analytics',
      ],
      2: [
        'Generative AI Models',
        'Autonomous Robotics',
        'Bachelor Thesis Preparation',
      ],
    },
  },
  'Ingineria Informației (Engleză)': {
    1: {
      1: [
        'Fundamentals of Programming',
        'Computer Systems Architecture',
        'Linear Algebra',
        'Mathematical Analysis',
        'Digital Electronics',
      ],
      2: [
        'Object Oriented Programming',
        'Data Structures and Algorithms',
        'Operating Systems',
        'Signals and Systems',
        'Probability and Statistics',
      ],
    },
    2: {
      1: [
        'Computer Networks',
        'Databases',
        'Advanced Programming Methods',
        'Microcontrollers and Embedded Systems',
      ],
      2: [
        'Software Engineering',
        'Web Technologies',
        'Information Theory and Coding',
        'Database Management Systems',
      ],
    },
    3: {
      1: [
        'Distributed Systems',
        'Cybersecurity and Cryptography',
        'Hardware-Software Co-Design',
        'Mobile Applications Engineering',
      ],
      2: [
        'Artificial Intelligence',
        'Cloud Computing Infrastructure',
        'Software Verification and Testing',
      ],
    },
    4: {
      1: [
        'Internet of Things (IoT)',
        'Enterprise Application Architecture',
        'Engineering Practice / Internship',
      ],
      2: [
        'DevOps and Scalable Systems',
        'Bachelor Diploma Project',
      ],
    },
  },
  'Ingineria Informației (Maghiară)': {
    1: {
      1: [
        'Programozás alapjai (Fundamentals of Programming)',
        'Számítógép-architektúrák (Computer Systems Architecture)',
        'Lineáris algebra (Linear Algebra)',
        'Matematikai analízis (Mathematical Analysis)',
        'Digitális elektronika (Digital Electronics)',
      ],
      2: [
        'Objektumorientált programozás (OOP)',
        'Adatszerkezetek és algoritmusok (DSA)',
        'Operációs rendszerek (Operating Systems)',
        'Jelek és rendszerek (Signals and Systems)',
        'Valószínűségszámítás és statisztika',
      ],
    },
    2: {
      1: [
        'Számítógép-hálózatok (Computer Networks)',
        'Adatbázisok (Databases)',
        'Haladó programozási módszerek (MAP)',
        'Mikrokontrollerek és beágyazott rendszerek',
      ],
      2: [
        'Szoftverrendszerek tervezése (Software Engineering)',
        'Webtechnológiák (Web Technologies)',
        'Információelmélet és kódolás',
        'Adatbázis-kezelő rendszerek (SGBD)',
      ],
    },
    3: {
      1: [
        'Elosztott rendszerek (Distributed Systems)',
        'Kiberbiztonság és kriptográfia',
        'Mobilalkalmazások tervezése',
      ],
      2: [
        'Mesterséges intelligencia (Artificial Intelligence)',
        'Felhőalapú számítások (Cloud Computing)',
        'Szoftverellenőrzés és tesztelés',
      ],
    },
    4: {
      1: [
        'Dolgok internete (IoT)',
        'Vállalati alkalmazások fejlesztése',
        'Szakmai gyakorlat',
      ],
      2: [
        'DevOps és skálázható rendszerek',
        'Diplomamunka készítése',
      ],
    },
  },
  'Matematică Informatică (Română)': MATE_INFO_3Y_RO,
  'Matematică Informatică (Engleză)': {
    1: {
      1: [
        'Fundamentals of Programming',
        'Linear Algebra',
        'Mathematical Analysis I (Differential Calculus)',
        'Analytical Geometry',
        'Computer Systems Architecture',
      ],
      2: [
        'Object Oriented Programming',
        'Data Structures and Algorithms',
        'Mathematical Analysis II (Integral Calculus)',
        'Algebraic Structures',
        'Operating Systems',
      ],
    },
    2: {
      1: [
        'Advanced Programming Methods',
        'Databases',
        'Differential Equations',
        'Complex Analysis',
        'Probability Theory',
      ],
      2: [
        'Web Programming',
        'Artificial Intelligence',
        'Mathematical Statistics',
        'Numerical Calculus',
        'Differential Geometry',
      ],
    },
    3: {
      1: [
        'Software Engineering',
        'Computer Networks',
        'Operations Research',
        'Partial Differential Equations',
      ],
      2: [
        'Computer Graphics',
        'Astronomy',
        'Bachelor Thesis Preparation',
      ],
    },
  },
  'Matematică Informatică (Maghiară)': {
    1: {
      1: [
        'Programozás alapjai (Fundamentele Programării)',
        'Lineáris algebra (Algebră Liniară)',
        'Matematikai analízis I (Analiză Matematică I)',
        'Analitikus geometria (Geometrie Analitică)',
        'Számítógép-architektúrák (ASC)',
      ],
      2: [
        'Objektumorientált programozás (POO)',
        'Adatszerkezetek és algoritmusok (SDA)',
        'Matematikai analízis II (Analiză Matematică II)',
        'Algebrai struktúrák (Structuri Algebrice)',
        'Operációs rendszerek (Sisteme de Operare)',
      ],
    },
    2: {
      1: [
        'Haladó programozási módszerek (MAP)',
        'Adatbázisok (Baze de Date)',
        'Differenciálegyenletek (Ecuații Diferențiale)',
        'Komplex analízis (Analiză Complexă)',
        'Valószínűségszámítás (Teoria Probabilităților)',
      ],
      2: [
        'Webprogramozás (Programare Web)',
        'Mesterséges intelligencia (Inteligență Artificială)',
        'Matematikai statisztika (Statistică Matematică)',
        'Numerikus analízis (Calcul Numeric)',
        'Differenciálgeometria (Geometrie Diferențială)',
      ],
    },
    3: {
      1: [
        'Szoftverrendszerek tervezése (ISS)',
        'Számítógép-hálózatok (Rețele de Calculatoare)',
        'Operációkutatás (Cercetări Operaționale)',
      ],
      2: [
        'Számítógépes grafika (Grafică pe Calculator)',
        'Csillagászat (Astronomie)',
        'Államvizsga-dolgozat készítése',
      ],
    },
  },
  'Matematică-Informatică dublă specializare (Română)': MATE_INFO_4Y_RO,
  'Matematică-Informatică dublă specializare (Engleză)': {
    1: {
      1: [
        'Fundamentals of Programming',
        'Linear Algebra',
        'Mathematical Analysis I',
        'Analytical Geometry',
        'Computer Systems Architecture',
      ],
      2: [
        'Object Oriented Programming',
        'Data Structures and Algorithms',
        'Mathematical Analysis II',
        'Algebraic Structures',
        'Operating Systems',
      ],
    },
    2: {
      1: [
        'Advanced Programming Methods',
        'Databases',
        'Differential Equations',
        'Complex Analysis',
        'Probability Theory',
      ],
      2: [
        'Web Programming',
        'Artificial Intelligence',
        'Mathematical Statistics',
        'Numerical Calculus',
        'Differential Geometry',
      ],
    },
    3: {
      1: [
        'Software Engineering',
        'Computer Networks',
        'Operations Research',
        'Partial Differential Equations',
      ],
      2: [
        'Computer Graphics',
        'Astronomy',
        'Mathematical Modeling',
      ],
    },
    4: {
      1: [
        'Functional Analysis',
        'Parallel and Distributed Programming',
        'Topology',
      ],
      2: [
        'Number Theory and Cryptography',
        'Software Verification and Validation',
        'Bachelor Thesis Preparation (Double Major)',
      ],
    },
  },
  'Matematică-Informatică dublă specializare (Maghiară)': {
    1: {
      1: [
        'Programozás alapjai',
        'Lineáris algebra',
        'Matematikai analízis I',
        'Analitikus geometria',
        'Számítógép-architektúrák',
      ],
      2: [
        'Objektumorientált programozás',
        'Adatszerkezetek és algoritmusok',
        'Matematikai analízis II',
        'Algebrai struktúrák',
        'Operációs rendszerek',
      ],
    },
    2: {
      1: [
        'Haladó programozási módszerek',
        'Adatbázisok',
        'Differenciálegyenletek',
        'Komplex analízis',
        'Valószínűségszámítás',
      ],
      2: [
        'Webprogramozás',
        'Mesterséges intelligencia',
        'Matematikai statisztika',
        'Numerikus analízis',
        'Differenciálgeometria',
      ],
    },
    3: {
      1: [
        'Szoftverrendszerek tervezése',
        'Számítógép-hálózatok',
        'Operációkutatás',
      ],
      2: [
        'Számítógépes grafika',
        'Csillagászat',
        'Matematikai modellezés',
      ],
    },
    4: {
      1: [
        'Funkcionálanalízis',
        'Párhuzamos és elosztott programozás',
        'Topológia',
      ],
      2: [
        'Számelmélet és kriptográfia',
        'Államvizsga-dolgozat készítése',
      ],
    },
  },
  'Matematică (Română)': {
    1: {
      1: [
        'Algebră I (Algebră Liniară)',
        'Analiză Matematică I',
        'Geometrie I (Geometrie Analitică)',
        'Algoritmi și Programare',
      ],
      2: [
        'Algebră II (Structuri Algebrice)',
        'Analiză Matematică II',
        'Geometrie II (Geometrie Afina și Euclidiană)',
        'Logică Matematică și Teoria Mulțimilor',
      ],
    },
    2: {
      1: [
        'Analiză Matematică III',
        'Ecuații Diferențiale',
        'Teoria Probabilităților',
        'Algebră III (Inele și Corpuri)',
      ],
      2: [
        'Analiză Complexă',
        'Analiză Funcțională',
        'Statistică Matematică',
        'Geometrie Diferențială',
      ],
    },
    3: {
      1: [
        'Ecuații cu Derivate Parțiale',
        'Analiză Numerică',
        'Topologie',
        'Mecanică Teoretică',
      ],
      2: [
        'Teoria Numerelor',
        'Calcul Variațional',
        'Elaborarea Lucrării de Licență',
      ],
    },
  },
  'Matematică (Maghiară)': {
    1: {
      1: [
        'Algebra I (Lineáris algebra)',
        'Matematikai analízis I',
        'Geometria I (Analitikus geometria)',
        'Algoritmusok és programozás',
      ],
      2: [
        'Algebra II (Algebrai struktúrák)',
        'Matematikai analízis II',
        'Geometria II (Affin és euklideszi geometria)',
        'Matematikai logika és halmazelmélet',
      ],
    },
    2: {
      1: [
        'Matematikai analízis III',
        'Differenciálegyenletek',
        'Valószínűségszámítás',
        'Algebra III (Gyűrűk és testek)',
      ],
      2: [
        'Komplex analízis',
        'Funkcionálanalízis',
        'Matematikai statisztika',
        'Differenciálgeometria',
      ],
    },
    3: {
      1: [
        'Parciális differenciálegyenletek',
        'Numerikus analízis',
        'Topológia',
        'Elméleti mechanika',
      ],
      2: [
        'Számelmélet',
        'Variációszámítás',
        'Államvizsga-dolgozat készítése',
      ],
    },
  },
};

export function getCoursesForSelection(
  specialization?: string,
  year?: number | '',
  semester?: number | ''
): string[] {
  if (!specialization) return [];
  const specData = UBB_FMI_CURRICULUM[specialization];
  if (!specData) return [];

  const courses: string[] = [];
  const yearsToCheck = year ? [Number(year)] : [1, 2, 3, 4];

  for (const y of yearsToCheck) {
    const yearData = specData[y];
    if (!yearData) continue;

    const semestersToCheck = semester ? [Number(semester)] : [1, 2];
    for (const s of semestersToCheck) {
      if (yearData[s]) {
        courses.push(...yearData[s]);
      }
    }
  }

  return Array.from(new Set(courses));
}