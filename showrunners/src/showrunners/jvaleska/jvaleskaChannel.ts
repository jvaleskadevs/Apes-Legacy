import { Polybase } from "@polybase/client"
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import config, { defaultSdkSettings } from '../../config';
import { EPNSChannel } from '../../helpers/epnschannel';
import { mockMessages } from './messages';

@Service()
export default class JValeskaChannel extends EPNSChannel {
  constructor(@Inject('logger') public logger: Logger) {
    super(logger, {
      networkToMonitor: config.alchemyAPI,
      dirname: __dirname,
      name: 'Apes Legacy by J. Valeska',
      url: 'https://apes-legacy.vercel.app/',
      useOffChain: true,
    });
    
  }
  // Checks for deadline Expiration and Sends notification to users
  async checkDeadlineExpirationTask(simulate) {
  	try {
	  	this.logInfo('Sending recordatories about claim date for Apes Legacy');
	  	
	  	this.logInfo('Fetching subscribed users...');

		const db = new Polybase({ defaultNamespace: "pk/0xb2de1a71c3b4ae98f578719241d1616e37dab9794ae430e12146c6b220df491adda19ac770387df81d6389099f580e4b63f2e349769afeceb657076fc9e6b19e/apes-legacy" });
		
		const subscribers = await this.getChannelSubscribers();
		console.log(subscribers);
		
		//const users = await db.collection("User").get();

	  	this.logInfo('Subscribed users loaded successfully');
	  	this.logInfo('Loading user data');
	  	
	  	for (let i = 0; i < subscribers.length; i++) {
	  		const user = subscribers[i];

	  		this.logInfo('User data loaded successfully');
	  		const notisData = await db.collection("Notifications").where("ownerId", "==", user).get();
	  		this.logInfo('Notifications data loaded successfully');
	  		
	  		const now = new Date().getTime();
	  		for (let j = 0; j < notisData.data.length; j++) {
		  		if (notisData.data[j].data.notifyAfter < now) {
		  			await this.deadlineAboutToExpire(user, notisData.data[j].data, false);
		  		}	  			
	  		}
	  	}
/*	  	
	  	for (let i = 0; i < users.data.length; i++) {
	  		const user = users.data[i].data;

	  		this.logInfo('User data loaded successfully');
	  		const notisData = await db.collection("Notifications").where("ownerId", "==", user.id).get();
	  		this.logInfo('Notifications data loaded successfully');
	  		
	  		const now = new Date().getTime();
	  		for (let j = 0; j < notisData.data.length; j++) {
		  		if (notisData.data[j].data.notifyAfter < now) {
		  			await this.deadlineAboutToExpire(user.id, notisData.data[j].data, false);
		  		}	  			
	  		}
	  	}
	  	*/
	  	return { success: true };
  	} catch (err) {
  		this.logError(err);
  	}
  }
  // Notify an address that the deadline is about to expire
  async deadlineAboutToExpire(recipient, userData, simulate) {
  	try {
  	  this.logInfo('Sending recordatories about claim date for Apes Legacy');
  	  
  	  const message = mockMessages.messages[0];
  	  const notificationType = 3; // targeted
  	  
  	  const deadline = new Date(userData.deadline);
  	  
  	  await this.sendNotification({
  	    recipient: recipient,
  	    title: message.title,
  	    message: `${message.msg}${userData.ape.toUpperCase()} #${userData.token}. Current: ${deadline}.`,
  	    payloadTitle: message.title,
  	    payloadMsg: `${message.msg}${userData.ape.toUpperCase()} #${userData.token}. Current: ${deadline}.`,
  	    notificationType: notificationType,
  	    cta: message.cta,
  	    image: null,
  	    simulate: simulate,
  	  });
  	  
  	  return { success: true };
  	} catch (err) {
  	  this.logError(err);
  	}
  }

  /**
   * The method responsible for handling webhook payload
   * @param payload
   */

  public async webhookPayloadHandler(payload: any, simulate: any) {
    const { Message } = payload;

    // do something with the payload
  }

}
