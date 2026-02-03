const axios = require("axios");

// 1. 模拟 Uptime Kuma 传入的数据
const monitorJSON = { 
    name: "生产环境API服务器",  // 这里填中文名，模拟你在 Kuma 里的配置
    url: "https://api.example.com" 
};
const msg = "Certificate will expire in 15 days"; // 模拟系统生成的英文消息

// 2. 你的汉化逻辑
let chineseMsg = msg;
if (msg.includes("Certificate will expire in")) {
    const daysMatch = msg.match(/\d+/);
    const days = daysMatch ? daysMatch[0] : "未知";
    chineseMsg = `域名证书即将到期：您的项目【${monitorJSON.name}】还有 ${days} 天就要过期了。`;
}

// 3. 准备发送给 Webhook.site 或企业微信
// 将下面的 URL 替换为你的 webhook.site 链接进行抓包测试
const targetUrl = "https://webhook.site/2b3aa160-6b72-4ee6-adeb-ee309644eab3";

const payload = {
    msgtype: "markdown",
    markdown: {
        content: `### 🛡️ 证书到期预警\n> **项目**: ${monitorJSON.name}\n> **详情**: <font color="warning">${chineseMsg}</font>\n> **原始信息**: ${msg}`
    }
};

// 4. 执行发送
async function runTest() {
    try {
        console.log("正在发送请求到 Webhook.site...");
        await axios.post(targetUrl, payload);
        console.log("✅ 发送完成！请刷新你的 Webhook.site 页面查看结果。");
    } catch (error) {
        console.error("❌ 发送失败:", error.message);
    }
}

runTest();