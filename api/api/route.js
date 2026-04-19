// api/route.js
import cheerio from 'cheerio';

export default async function handler(req, res) {
  // CORS হ্যান্ডেল করা (যাতে যেকোনো ডোমেইন থেকে কল করা যায়)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
      // টার্গেট URL
      const targetUrl = 'https://naimurrahmannahid.com/naimur-courier-ratio-checker/';
      
      // যদি ওয়েবসাইটটি URL Parameter এ নাম্বার নিয়ে রেজাল্ট দেখায় তবে নিচের লাইনটি একটিভ রাখুন
      const searchUrl = `${targetUrl}?phone=${phone}`; 
      
      // অথবা যদি POST request দরকার হয় তবে fetch এর মেথড পরিবর্তন করতে হবে। 
      // এখানে আমরা GET মেথড দিয়ে পেজটি লোড করছি।
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch target website');
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // ---------------------------------------------------------
      // নিচের অংশটি কাস্টমাইজ করতে হবে:
      // আপনাকে ওই ওয়েবসাইটে গিয়ে Inspect করে রেজাল্টের আইডি বা ক্লাস বের করতে হবে।
      // ধরুন রেজাল্ট একটি div এর মধ্যে আছে যার id="result"।
      // ---------------------------------------------------------
      
      // উদাহরণ হিসেবে আমি একটি জেনেরিক সিলেক্টর দিয়েছি।
      // আপনি টার্গেট সাইটে রাইট ক্লিক করে Inspect করে দেখুন রেজাল্ট কোথায় আসে।
      // ধরুন রেজাল্ট টেক্সট একটি <td> বা <div> এর ভেতরে।
      
      // আমি এখানে একটি সম্ভাব্য সিলেক্টর দিচ্ছি, এটি কাজ না করলে আপনাকে পরিবর্তন করতে হবে।
      // সাধারণত এই ধরণের সাইটে রেজাল্ট কোনো টেবিল বা নির্দিষ্ট ক্লাসে থাকে।
      
      let resultText = "";
      
      // কৌশল: পেজের মধ্যে "Ratio" শব্দটি আছে কিনা বা নির্দিষ্ট কোনো এলিমেন্ট খুঁজে বের করা।
      // যেহেতু আমি সরাসরি সাইটটি দেখতে পাচ্ছি না, তাই আমি body থেকে টেক্সট এক্সট্রাক্ট করার চেষ্টা করছি।
      // আপনি যদি নিশ্চিত হন যে রেজাল্ট একটি নির্দিষ্ট ক্লাসে আসে (যেমন .ratio-result), তবে নিচের লাইনটি দিন:
      // resultText = $('.your-result-class').text().trim();

      // বর্তমানে আমি সম্পূর্ণ বডি বা কন্টেইনার থেকে রেজাল্ট খুঁজছি (এটি একটি জেনেরিক অ্যাপ্রোচ)
      // আপনাকে নিচের selector টি পরিবর্তন করতে হবে যা ওই ওয়েবসাইটে মিলে।
      
      // উদাহরণ: ধরুন রেজাল্টটি <td class="column-2">1.50</td> এর মধ্যে আছে
      const possibleResult = $('td').filter(function() {
        return $(this).text().match(/^\d+\.\d+$/); // ডেসিমাল নাম্বার খোঁজার চেষ্টা
      }).first().text();

      if (possibleResult) {
          resultText = possibleResult;
      } else {
          // যদি উপরের লজিকে না পাওয়া যায়, তবে সম্পূর্ণ টেক্সট বা নির্দিষ্ট ডিভ থেকে আনা লাগতে পারে।
          // আপনার কাজ হলো নিচের লাইনের selector ঠিক করা:
          resultText = $('#result-element-id, .result-class').text().trim();
          
          if(!resultText) resultText = "Result not found (Check selector)";
      }

      // JSON রেসপন্স প্রেপার করা
      const data = {
        phone: phone,
        ratio: resultText,
        status: resultText ? 'success' : 'not_found',
        source: 'naimur-courier-checker'
      };

      return res.status(200).json(data);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}