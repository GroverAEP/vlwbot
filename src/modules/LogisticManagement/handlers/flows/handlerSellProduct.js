import pkg from 'pg';
import { pg_insert_product } from '../../services/a.js';
import { RepositoryServicesProduct } from '../../repository/repository_services_product.js';
import { ServiceSellProducts } from '../../services/api/service_sell_products.js';
import { MessageSellProducts } from '../messages/MessageSellProducts.js';
import { error } from 'qrcode-terminal';

const { Pool } = pkg;


export const handlerSellProduct= {
    name: "pokemonApi",
    role: "all",
    run: sellProducts,
};

// 📦 nivel de módulo (archivo)
// const session = new Map();
const ENUM_STEP = Object.freeze({
  WAIT_PROCESS: 'WAIT_PROCESS',
  CONFIRM: 'CONFIRM',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED'
});

function stringToObject(str){
  
return str
    .replace(/\s+/g, '')          // quitar espacios
    .split('|')                   // separar bloques
    .filter(Boolean)              // eliminar vacíos
    .map(block => {
        const obj = {};
        block.split(',').forEach(pair => {
            const [key, value] = pair.split(':');

            if (key === 'cantidad') {
                obj[key] = value ? Number(value) : 0;
            } else {
                obj[key] = value ?? "";
            }
        });
   if (obj[`codigo`] === undefined && obj[`cantidad`] === undefined) {
        return {};
    } 
    const fixed ={
        sku: obj['codigo'],
        quantity: obj['cantidad']
    }
        return fixed;
    });
}

async function sellProducts({msg,client,cmd,setSession,getSession}) {
    const Conexion = client.db.postgres; 
    const pool = Conexion.getInstance();
   
    const repositoryServicesProduct = new RepositoryServicesProduct({pool});

    const from = msg.key.participant
    // const sellUserSession = sessions.get(from);
    
    const data = stringToObject(cmd);
    console.log(data)

    // si no existe la sesión del chat
    // if (!session) {
    // session = {};
    // session.set(from, session);
    // }
    // list_id_user:[
        //{
            // id_user:,
            // step: 
            // }
            //]  
            
    // if (!Object.hasOwn(session, id_user)) {
    //     session.set(from,{step:ENUM_STEP[0]})
    //     // existe
    // }


    if (setSession({from,action:"WAIT_PROCESS"})) {
        console.log("verificando la sesion en set")
        // console.log(setSession({from}));
        return await client.send.text(msg,"Comando de venta inicializado: Porfavor ingrese los productos")    
    };
    
    console.log(`Usuario existe en la session:${from}`)
    // return await client.send.reply(msg,"Comando de venta inicializado: Porfavor ingrese los productos")    

    //cmd parsealo aun formato json

    const session = await getSession();

    console.log(`Obteniendo la session: ${session} `)
   try {
    const currentSession = session.get(from);
    const step = currentSession?.step;

    switch (step) {

        // 🔹 CONFIRMACIÓN DE VENTA
        case ENUM_STEP.CONFIRM: {

            if (cmd.toLowerCase() === "si") {
                console.log(currentSession.data);

                await client.send.reply(msg, "ejecut");
                setSession({ from, action: "SUCCESS" });

            } else {
                await client.send.reply(msg, "Proceso de venta cancelado");
                setSession({ from, action: "CANCELLED" });
            }

            break;
        }

        // 🔹 PRE-PROCESO DE VENTA
        case ENUM_STEP.WAIT_PROCESS: {

            let ssc;
            try {
                ssc = await repositoryServicesProduct.sellPreProducts({ data });
            } catch (error) {
                console.error(error);
                break;
            }

            console.log(ssc);

            await client.send.reply(
                msg,
                MessageSellProducts.default({ ssc })
            );

            await client.send.text(
                msg,
                MessageSellProducts.total({ ssc })
            );

            // 🔘 Botones
            const botones = [
                {
                    buttonId: 'btn_si',
                    buttonText: { displayText: 'Sí, quiero' },
                    type: 1
                },
                {
                    buttonId: 'btn_no',
                    buttonText: { displayText: 'No gracias' },
                    type: 1
                },
                {
                    buttonId: 'btn_mas',
                    buttonText: { displayText: 'Más info' },
                    type: 1
                }
            ];

            const mensaje = {
                text: '¿Te gustaría recibir actualizaciones diarias?',
                footer: 'Elige una opción ↓',
                buttons: botones,
                headerType: 1
            };

            try {
                const enviado = await client.sock.sendMessage(
                    msg.key.remoteJid,
                    mensaje
                );
                console.log('Mensaje con botones enviado:', enviado.key);
            } catch (error) {
                console.error('Error al enviar botones:', error);
            }

            setSession({
                from,
                action: "CONFIRMED",
                data: ssc
            });

            // ⛔ Detiene el flujo aquí
            return;
        }

        // 🔹 DEFAULT
        default: {
            await client.send.reply(msg, "No entendí tu solicitud");
            break;
        }
    }

} catch (error) {
    console.error("Error en flujo de venta:", error);
}

    // if (session.get()) {
        
    // }

    // const exists = session.some(
    // u => u.id_user === id_user
    // );

 
    // ENUM_STEP[0]
 
    // ServiceSellConfirmed();
    

}