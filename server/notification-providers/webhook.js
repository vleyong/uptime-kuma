const NotificationProvider = require("./notification-provider");
const axios = require("axios");
const FormData = require("form-data");

class Webhook extends NotificationProvider {
    name = "webhook";

    /**
     * @inheritdoc
     */
    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        const okMsg = "Sent Successfully.";

        try {
            const httpMethod = notification.httpMethod?.toLowerCase() || "post";
            // 简单的汉化逻辑
            let chineseMsg = msg;
            if (msg.includes("Certificate will expire in")) {
                const days = msg.match(/\d+/); // 提取数字
                chineseMsg = `域名证书即将到期：您的域名还有 ${days} 天就要过期了。`;
            } else if (msg.includes("Certificate has expired")) {
                chineseMsg = `域名证书已过期：请立即处理！`;
            }

            console.log(`[Webhook] 汉化后的消息内容: ${chineseMsg}`);
            let data = {
                heartbeat: heartbeatJSON,
                monitor: monitorJSON,
                msg: chineseMsg, // 使用汉化后的消息
            };        
            let data = {
                heartbeat: heartbeatJSON,
                monitor: monitorJSON,
                msg,
            };
            let config = {
                headers: {},
            };

            if (httpMethod === "get") {
                config.params = {
                    msg: msg,
                };

                if (heartbeatJSON) {
                    config.params.heartbeat = JSON.stringify(heartbeatJSON);
                }

                if (monitorJSON) {
                    config.params.monitor = JSON.stringify(monitorJSON);
                }
            } else if (notification.webhookContentType === "form-data") {
                const formData = new FormData();
                formData.append("data", JSON.stringify(data));
                config.headers = formData.getHeaders();
                data = formData;
            } else if (notification.webhookContentType === "custom") {
                data = await this.renderTemplate(notification.webhookCustomBody, msg, monitorJSON, heartbeatJSON);
            }

            if (notification.webhookAdditionalHeaders) {
                try {
                    config.headers = {
                        ...config.headers,
                        ...JSON.parse(notification.webhookAdditionalHeaders),
                    };
                } catch (err) {
                    throw new Error("Additional Headers is not a valid JSON");
                }
            }

            config = this.getAxiosConfigWithProxy(config);

            if (httpMethod === "get") {
                await axios.get(notification.webhookURL, config);
            } else {
                await axios.post(notification.webhookURL, data, config);
            }

            return okMsg;
        } catch (error) {
            this.throwGeneralAxiosError(error);
        }
    }
}

module.exports = Webhook;
