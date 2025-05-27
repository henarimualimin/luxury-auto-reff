const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.clear();

console.log(chalk.blue(`
█████╗ ██╗   ██╗████████╗ ██████╗
██╔══██╗██║   ██║╚══██╔══╝██╔═══██╗
███████║██║   ██║   ██║   ██║   ██║
██╔══██║██║   ██║   ██║   ██║   ██║
██║  ██║╚██████╔╝   ██║   ╚██████╔╝
╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝
`));

console.log(chalk.red('ＢＯＴ ') + chalk.yellow('ＡＵＴＯ ') + chalk.green('ＲＥＧＩＳＴＥＲ ') + chalk.cyan('ＬＵＸＵＲＹ'));
console.log(chalk.cyan('Telegram: https://t.me/airdropdiggerid'));
console.log(chalk.magenta('================================================================'));

// Config
const REFERRAL_CODE = 'bangcrot';
const BASE_URL = 'https://luxury-airdrop.onrender.com';
let NUM_REGISTRATIONS = 0; // Will be set by user input
const MIN_DELAY = 5000; // Delay minimal 5 detik antara request
const MAX_DELAY = 15000; // Delay maksimal 15 detik antara request

// Fungsi untuk menghasilkan username acak
function generateRandomUsername() {
  const prefix = ['cool', 'awesome', 'super', 'mega', 'ultra', 'pro', 'legend', 'ninja', 'ghost', 'shadow'];
  const suffix = ['hunter', 'player', 'gamer', 'master', 'warrior', 'king', 'queen', 'star', 'bot', 'node'];
  const randomNum = Math.floor(Math.random() * 1000);
  
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomSuffix = suffix[Math.floor(Math.random() * suffix.length)];
  
  return `${randomPrefix}${randomSuffix}${randomNum}`;
}

// Fungsi untuk delay acak
function randomDelay() {
  const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
  console.log(chalk.yellow(`Menunggu ${delay/1000} detik sebelum request berikutnya...`));
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Fungsi untuk validasi referral dengan retry
async function validateReferral(retryCount = 0) {
  try {
    const response = await axios.get(`${BASE_URL}/api/validate-referrer/${REFERRAL_CODE}`, {
      headers: {
        'authority': 'luxury-airdrop.onrender.com',
        'accept': '*/*',
        'accept-language': 'id,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
        'origin': 'https://luxury-airdrop.netlify.app',
        'referer': 'https://luxury-airdrop.netlify.app/',
        'sec-ch-ua': '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0'
      }
    });
    
    if (response.data.valid) {
      console.log(chalk.green('Referral valid:'), chalk.cyan(REFERRAL_CODE));
      return true;
    } else {
      console.log(chalk.red('Referral tidak valid'));
      return false;
    }
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      console.log(chalk.yellow(`Terlalu banyak request, mencoba lagi dalam 30 detik... (Percobaan ${retryCount + 1})`));
      await new Promise(resolve => setTimeout(resolve, 30000));
      return validateReferral(retryCount + 1);
    }
    console.error(chalk.red('Error validasi referral:'), error.message);
    return false;
  }
}

// Fungsi untuk registrasi username dengan retry
async function registerUsername(username, retryCount = 0) {
  try {
    const payload = {
      username: username,
      ref: REFERRAL_CODE
    };
    
    const response = await axios.post(`${BASE_URL}/api/create-username`, payload, {
      headers: {
        'authority': 'luxury-airdrop.onrender.com',
        'accept': '*/*',
        'accept-language': 'id,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
        'content-type': 'application/json',
        'origin': 'https://luxury-airdrop.netlify.app',
        'referer': 'https://luxury-airdrop.netlify.app/',
        'sec-ch-ua': '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0'
      }
    });
    
    if (response.data.success) {
      console.log(chalk.green(`Registrasi berhasil untuk username:`), chalk.cyan(username));
      console.log(chalk.green(`Balance LXY:`), chalk.yellow(response.data.data.balanceLXY));
      return true;
    } else {
      console.log(chalk.red('Registrasi gagal'));
      return false;
    }
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      console.log(chalk.yellow(`Terlalu banyak request, mencoba lagi dalam 30 detik... (Percobaan ${retryCount + 1})`));
      await new Promise(resolve => setTimeout(resolve, 30000));
      return registerUsername(username, retryCount + 1);
    }
    console.error(chalk.red(`Error registrasi username ${username}:`), error.response?.data?.message || error.message);
    return false;
  }
}

// Fungsi untuk mendapatkan referral link dengan retry
async function getReferralLink(username, retryCount = 0) {
  try {
    const timestamp = Date.now();
    const response = await axios.get(`${BASE_URL}/api/referral-link/${username}?ts=${timestamp}`, {
      headers: {
        'authority': 'luxury-airdrop.onrender.com',
        'accept': '*/*',
        'accept-language': 'id,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
        'origin': 'https://luxury-airdrop.netlify.app',
        'referer': 'https://luxury-airdrop.netlify.app/',
        'sec-ch-ua': '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0'
      }
    });
    
    console.log(chalk.blue(`Referral link untuk ${username}:`), chalk.cyan(response.data.referralLink));
    return response.data.referralLink;
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      console.log(chalk.yellow(`Terlalu banyak request, mencoba lagi dalam 30 detik... (Percobaan ${retryCount + 1})`));
      await new Promise(resolve => setTimeout(resolve, 30000));
      return getReferralLink(username, retryCount + 1);
    }
    console.error(chalk.red(`Error mendapatkan referral link untuk ${username}:`), error.message);
    return null;
  }
}

// Fungsi untuk mendapatkan info user dengan retry
async function getUserInfo(username, retryCount = 0) {
  try {
    const timestamp = Date.now();
    const response = await axios.get(`${BASE_URL}/api/user/${username}?ts=${timestamp}`, {
      headers: {
        'authority': 'luxury-airdrop.onrender.com',
        'accept': '*/*',
        'accept-language': 'id,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
        'origin': 'https://luxury-airdrop.netlify.app',
        'referer': 'https://luxury-airdrop.netlify.app/',
        'sec-ch-ua': '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0'
      }
    });
    
    console.log(chalk.blue(`Info user ${username}:`), {
      balanceLXY: chalk.yellow(response.data.balanceLXY),
      pendingRewards: chalk.yellow(response.data.pendingRewards),
      referrals: chalk.yellow(response.data.referrals.length)
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 3) {
      console.log(chalk.yellow(`Terlalu banyak request, mencoba lagi dalam 30 detik... (Percobaan ${retryCount + 1})`));
      await new Promise(resolve => setTimeout(resolve, 30000));
      return getUserInfo(username, retryCount + 1);
    }
    console.error(chalk.red(`Error mendapatkan info user ${username}:`), error.message);
    return null;
  }
}

// Fungsi utama
async function main() {
  // Get user input for number of registrations
  NUM_REGISTRATIONS = await new Promise(resolve => {
    readline.question(chalk.green('Masukkan jumlah akun yang ingin diregister: '), answer => {
      resolve(parseInt(answer));
    });
  });
  
  readline.close();
  
  console.log(chalk.blue(`Memulai proses auto register untuk ${NUM_REGISTRATIONS} akun...`));
  
  // Validasi referral terlebih dahulu
  const isReferralValid = await validateReferral();
  if (!isReferralValid) {
    console.log(chalk.red('Proses dihentikan karena referral tidak valid'));
    return;
  }
  
  // Lakukan registrasi sebanyak NUM_REGISTRATIONS
  for (let i = 0; i < NUM_REGISTRATIONS; i++) {
    const username = generateRandomUsername();
    console.log(chalk.magenta('\n================================================================'));
    console.log(chalk.blue(`\nMemproses registrasi ke-${i + 1} dari ${NUM_REGISTRATIONS} dengan username:`), chalk.cyan(username));
    
    const registrationSuccess = await registerUsername(username);
    
    if (registrationSuccess) {
      // Dapatkan referral link
      await getReferralLink(username);
      
      // Dapatkan info user
      await getUserInfo(username);
    }
    
    // Jeda acak antara 5-15 detik antara setiap registrasi
    if (i < NUM_REGISTRATIONS - 1) {
      await randomDelay();
    }
    
    console.log(chalk.magenta('================================================================'));
  }
  
  console.log(chalk.green('\nProses auto register selesai'));
}

// Jalankan program
main().catch(err => {
  console.error(chalk.red('Error:'), err);
  readline.close();
});